require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// Cloudinary configuration (expects env vars in api/.env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage for multipart uploads
const upload = multer({ storage: multer.memoryStorage() });

app.get("/", (req, res) => res.json({ ok: true }));

// auth middleware
function authenticateToken(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "missing_authorization" });
    const parts = auth.split(" ");
    if (parts.length !== 2)
        return res.status(401).json({ error: "invalid_authorization" });
    const token = parts[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.userId;
        next();
    } catch (e) {
        return res.status(401).json({ error: "invalid_token" });
    }
}

app.get("/me", authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });
        if (!user) return res.status(404).json({ error: "not_found" });
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "internal_error" });
    }
});

app.post("/signup", async (req, res) => {
    const { email, password, name, role } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: "email and password required" });
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing)
            return res.status(409).json({ error: "User already exists" });
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, passwordHash, name, role: role || "tenant" },
        });
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
            expiresIn: "7d",
        });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "internal_error" });
    }
});

// Image upload endpoint - accepts multipart/form-data 'images' field (multiple)
// Returns: { urls: [ ... ] }
app.post(
    "/upload",
    authenticateToken,
    upload.array("images", 10),
    async (req, res) => {
        try {
            if (!req.files || req.files.length === 0)
                return res.status(400).json({ error: "no_files" });

            const uploads = await Promise.all(
                req.files.map((file) => {
                    return new Promise((resolve, reject) => {
                        const opts = {
                            folder:
                                process.env.CLOUDINARY_UPLOAD_FOLDER ||
                                "bete_properties",
                        };
                        const stream = cloudinary.uploader.upload_stream(
                            opts,
                            (err, result) => {
                                if (err) return reject(err);
                                resolve(result.secure_url);
                            }
                        );
                        streamifier.createReadStream(file.buffer).pipe(stream);
                    });
                })
            );

            res.json({ urls: uploads });
        } catch (e) {
            console.error("upload error", e);
            res.status(500).json({ error: "upload_failed" });
        }
    }
);

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: "email and password required" });
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(401).json({ error: "invalid_credentials" });
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: "invalid_credentials" });
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
            expiresIn: "7d",
        });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "internal_error" });
    }
});

// simple endpoint to list properties (mock from DB)
app.get("/properties", async (req, res) => {
    try {
        const properties = await prisma.property.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
        });
        res.json({ properties });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "internal_error" });
    }
});

// Get property by id
app.get("/properties/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const property = await prisma.property.findUnique({ where: { id } });
        if (!property) return res.status(404).json({ error: "not_found" });
        res.json({ property });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "internal_error" });
    }
});
app.get("/properties", async (req, res) => {
    try {
        const { city, minPrice, maxPrice, type } = req.query;
        const where = {};
        if (city) where.city = { equals: city };
        if (type) where.type = { equals: type };
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = Number(minPrice);
            if (maxPrice) where.price.lte = Number(maxPrice);
        }
        const properties = await prisma.property.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: 100,
        });
        res.json({ properties });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "internal_error" });
    }
});

// Protected property routes
app.post("/properties", authenticateToken, async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            type,
            city,
            lat,
            lng,
            images,
            address,
        } = req.body;
        if (!title || !price)
            return res.status(400).json({ error: "title_and_price_required" });
        const property = await prisma.property.create({
            data: {
                ownerId: req.userId,
                title,
                description,
                price: Number(price),
                type,
                city,
                lat: lat ? Number(lat) : null,
                lng: lng ? Number(lng) : null,
                images: images || [],
                address,
            },
        });
        res.json({ property });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "internal_error" });
    }
});

app.put("/properties/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.property.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: "not_found" });
        if (existing.ownerId !== req.userId)
            return res.status(403).json({ error: "forbidden" });
        const data = req.body;
        if (data.price) data.price = Number(data.price);
        const updated = await prisma.property.update({ where: { id }, data });
        res.json({ property: updated });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "internal_error" });
    }
});

app.delete("/properties/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.property.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: "not_found" });
        if (existing.ownerId !== req.userId)
            return res.status(403).json({ error: "forbidden" });
        await prisma.property.delete({ where: { id } });
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "internal_error" });
    }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Bete API listening on ${port}`));

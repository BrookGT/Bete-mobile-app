import api from "./api";

// Upload a single local image URI to the backend /upload/image endpoint
// Returns secure URL from Cloudinary
export async function uploadImage(uri) {
    if (!uri) return null;
    const name = uri.split("/").pop() || `photo.jpg`;
    const form = new FormData();
    form.append("image", {
        uri,
        name,
        type: "image/jpeg",
    });
    const resp = await api.post("/upload/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
    });
    return resp.data?.imageUrl || null;
}

// Upload multiple images sequentially and return array of URLs
export async function uploadImages(uris = []) {
    const results = [];
    for (const u of uris) {
        const url = await uploadImage(u);
        if (url) results.push(url);
    }
    return results;
}

export default { uploadImage, uploadImages };

// Very small in-memory mock chat service to use while backend is not ready.
const chats = {
    1: [
        { id: "m1", text: "Hello! Is the property available?", fromMe: false },
        { id: "m2", text: "Yes — you can schedule a viewing.", fromMe: true },
    ],
};

export function fetchChats() {
    return Object.keys(chats).map((id) => ({
        id,
        title: `Conversation ${id}`,
        last: chats[id].slice(-1)[0].text,
    }));
}

export function fetchMessages(chatId) {
    return chats[chatId] || [];
}

export function sendMessage(chatId, message) {
    if (!chats[chatId]) chats[chatId] = [];
    const m = { id: String(Date.now()), text: message, fromMe: true };
    chats[chatId].push(m);
    return m;
}

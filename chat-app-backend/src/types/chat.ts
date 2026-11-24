export interface Chat {
    id: string;
    type: "direct" | "group";
    createdAt: Date;
}
export interface UserChatRow {
    id: string;
    type: string;
    createdAt: Date;
    members: { id: string; name: string }[];
}
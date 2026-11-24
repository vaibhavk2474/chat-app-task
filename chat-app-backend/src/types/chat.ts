export interface Chat {
    id: string;
    type: "direct" | "group";
    createdAt: Date;
}
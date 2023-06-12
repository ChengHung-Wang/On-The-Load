import { Socket } from "socket.io";
export interface userInfo {
    id: string;
    nickname?: string;
}
export interface DataStruct {
    type: "command" | "sync" | "media" | "result" | "error",
    hash?: string,
    data?: {
        command?: string,
        position?: {
            x: number,
            y: number,
            z: number
        },
        speed?: number,
        player_id: string,
        group_id?: string,
        auth?: string,
        others?: any,
        memberList?: any,
        nickname?: string,
        jointGroup?: string,
        Information?: userInfo,
        code?: string,
        reason_key?: string,
        rank?: number,
    }
}

export interface Methods {
    send(socket: Socket, data: DataStruct): void
}
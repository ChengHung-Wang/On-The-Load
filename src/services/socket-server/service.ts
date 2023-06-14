// @ts-ignore
import { Server, Socket } from "socket.io";
// @ts-ignore
import cors from 'cors';
import * as Sender from "./sender";
import * as SocketStruct from "@/services/socket-server/struct";
import { CommandRouter } from "@/services/socket-server/router";
import { createServer } from "http";
import express from 'express';

import type { event, member } from "@/services/socket-server/struct";

export default class SocketService {
    // socket.io object
    public io: Server;

    // sender service
    protected sender = {
        result: new Sender.Result(),
        sync: new Sender.Sync()
    };

    // 活動列表
    public events: Map<string, event> = new Map();

    // player_id -> member
    public membersMap: Map<string, member> = new Map();

    constructor(port: number = 3000) {
        const app = express();
        app.use(cors());
        const server = createServer(app);

        this.io = new Server(server, {
            // @ts-ignore
            allowEIO3: true,
            cors: {
                origin: '*',
            }
        });

        this.io.on('connection', async (socket: Socket) => {
            await this.registerMember(socket);

            socket.on("command", async (data: SocketStruct.DataStruct) => {
                new CommandRouter(socket, data);
            });

            socket.on("disconnect", () => {
                this.membersMap.delete(socket.id);
            })
        });

        server.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    }

    public async registerMember(socket: Socket): Promise<void> {
        const allClients = await this.getClients();
        this.membersMap.set(socket.id, {
            playerId: socket.id,
            permission: "user",
            nickname: ""
        });
        this.sender.sync.send(this.io, <SocketStruct.DataStruct>{
            type: "sync",
            data: {
                clientAmount: allClients.length
            }
        });
    }

    public async getClients(roomName: Array<string> = []): Promise<(member | undefined)[]> {
        const data = await (roomName.length == 0 ? this.io.fetchSockets() : this.io.in(roomName).fetchSockets());
        return Array<string>(data).map(socketID => {
            return this.membersMap.get(socketID);
        })
    }
}

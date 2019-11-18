import {
    RUN_TOWER_TIMER,
    RUN_LAB_TIMER,
    RUN_LINKS_TIMER,
    RUN_TERMINAL_TIMER,
    RUN_ROOM_STATE_TIMER,
    RUN_DEFCON_TIMER,
    RUN_RESERVE_TTL_TIMER,
    RUN_RAMPART_STATUS_UPDATE,
    ROOM_STATE_UPGRADER,
    ROOM_STATE_NUKE_INBOUND,
    MemoryHelper_Room,
    RoomHelper,
    MemoryApi,
    RoomApi
} from "utils/internals";

// room-wide manager
export class RoomManager {
    /**
     * run the room for every room
     */
    public static runRoomManager(): void {
        // Run all owned rooms
        const ownedRooms: Room[] = MemoryApi.getOwnedRooms();
        _.forEach(ownedRooms, (room: Room) => {
            this.runSingleRoom(room);
        });

        // Run all dependent rooms we have visiblity in
        const dependentRooms: Room[] = MemoryApi.getVisibleDependentRooms();
        _.forEach(dependentRooms, (room: Room) => {
            this.runSingleDependentRoom(room);
        });
    }

    /**
     * run the room for a single owned room
     * @param room the room we are running this manager function on
     */
    private static runSingleRoom(room: Room): void {
        // Set Defcon and Room State (roomState relies on defcon being set first)
        if (RoomHelper.excecuteEveryTicks(RUN_DEFCON_TIMER)) {
            RoomApi.setDefconLevel(room);
        }

        if (RoomHelper.excecuteEveryTicks(RUN_ROOM_STATE_TIMER)) {
            RoomApi.setRoomState(room);
        }

        const defcon: number = MemoryApi.getDefconLevel(room);
        if (room.controller!.safeModeAvailable) {
            RoomApi.runSafeMode(room, defcon);
        }

        // Run all structures in the room if they exist
        // Run Towers
        const roomState = room.memory.roomState;
        if (RoomHelper.excecuteEveryTicks(RUN_TOWER_TIMER) && RoomHelper.isExistInRoom(room, STRUCTURE_TOWER)) {
            // Check first if we have EMERGECY ramparts to heal up
            // I just got this to work while it was bug testable, so feel free to refactor into something thats NOT this (maybe pull into a function either way idc)
            const rampart: Structure<StructureConstant> = <Structure<StructureConstant>>(
                _.first(
                    room.find(FIND_MY_STRUCTURES, {
                        filter: (s: any) => s.structureType === STRUCTURE_RAMPART && s.hits < 1000
                    })
                )
            );
            if (rampart) {
                RoomApi.runTowersEmergecyRampartRepair(rampart as StructureRampart);
            } else if (defcon >= 1) {
                RoomApi.runTowersDefense(room);
            } else if (roomState === ROOM_STATE_UPGRADER || roomState === ROOM_STATE_NUKE_INBOUND) {
                room.memory.shotLastTick = false;
                RoomApi.runTowersRepair(room);
            } else {
                room.memory.shotLastTick = false;
            }
        }

        // Run Labs
        if (RoomHelper.isExistInRoom(room, STRUCTURE_LAB) && RoomHelper.excecuteEveryTicks(RUN_LAB_TIMER)) {
            RoomApi.runLabs(room);
        }

        // Run Links
        if (RoomHelper.isExistInRoom(room, STRUCTURE_LINK) && RoomHelper.excecuteEveryTicks(RUN_LINKS_TIMER)) {
            RoomApi.runLinks(room);
        }

        // Run Terminals
        if (RoomHelper.isExistInRoom(room, STRUCTURE_TERMINAL) && RoomHelper.excecuteEveryTicks(RUN_TERMINAL_TIMER)) {
            RoomApi.runTerminal(room);
        }

        // Set Rampart access status
        if (
            RoomHelper.isExistInRoom(room, STRUCTURE_RAMPART) &&
            RoomHelper.excecuteEveryTicks(RUN_RAMPART_STATUS_UPDATE)
        ) {
            RoomApi.runSetRampartStatus(room);
        }

        // Run accessory functions for dependent rooms ----
        // Update reserve timer for remote rooms
        if (RoomHelper.excecuteEveryTicks(RUN_RESERVE_TTL_TIMER)) {
            RoomApi.simulateReserveTTL(room);
        }
    }

    /**
     * run the room for an unowned room
     * @param room the room we are running
     */
    private static runSingleDependentRoom(room: Room): void {
        // Set Defcon for the dependent room
        if (RoomHelper.excecuteEveryTicks(RUN_ROOM_STATE_TIMER)) {
            RoomApi.setDefconLevel(room);
        }
    }
}

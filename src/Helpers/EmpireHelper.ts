import MemoryApi from "../Api/Memory.Api";
import UtilHelper from "./UtilHelper";
import UserException from "utils/UserException";

export default class EmpireHelper {

    /**
     * commit a remote flag to memory
     * @param flag the flag we want to commit
     */
    public static processNewRemoteFlag(flag: Flag): void {
        // save the remote room into the proper memory blah blah blah
    }

    /**
     * commit a attack flag to memory
     * @param flag the flag we want to commit
     */
    public static processNewAttackFlag(flag: Flag): void {
        // save the attack room into the proper memory blah blah blah
    }

    /**
     * commit a claim flag to memory
     * @param flag the flag we want to commit
     */
    public static processNewClaimFlag(flag: Flag): void {
        // save the claim room into the proper memory blah blah blah
    }

    /**
     * commit a depedent room over-ride flag to memory
     * @param flag the flag we are commiting to memory
     */
    public static processNewDependentRoomOverrideFlag(flag: Flag): void {

        // Set all the memory values for the flag
        Memory.flags[flag.name].active = true;
        Memory.flags[flag.name].complete = false;
        Memory.flags[flag.name].processed = true;
        Memory.flags[flag.name].timePlaced = Game.time;
    }

    /**
     * finds the closest colonized room to support a
     * Remote/Attack/Claim room
     * Calls helper functions to decide auto or over-ride
     * @param targetRoom the room we want to support
     */
    public static findDependentRoom(targetRoom: Room): string {

        // Green & White flags are considered override flags, get those and find the one that was placed most recently
        const allOverrideFlags = MemoryApi.getAllFlags((flag: Flag) => flag.color === COLOR_GREEN && flag.secondaryColor === COLOR_WHITE);
        let overrideFlag: Flag | undefined;

        // If we don't have any d-room override flags, we don't need to worry about it and will use auto room detection
        if (allOverrideFlags.length > 0) {
            for (const flag of allOverrideFlags) {
                if (!overrideFlag) {
                    overrideFlag = flag;
                }
                else {
                    if (flag.memory.timePlaced > overrideFlag.memory.timePlaced) {
                        overrideFlag = flag;
                    }
                }
            }

            // Set the override flag as complete and call the helper to find the override room
            Memory.flags[overrideFlag!.name].complete = true;
            return this.findDependentRoomManual(targetRoom, overrideFlag!);
        }

        // If no override flag was found, automatically find closest dependent room
        return this.findDependentRoomAuto(targetRoom);
    }

    /**
     * Automatically come up with a dependent room
     * @param targetRoom the room we want to support
     */
    public static findDependentRoomAuto(targetRoom: Room): string {

        const ownedRooms = MemoryApi.getOwnedRooms();
        let shortestPathRoom: Room | undefined;
        const targetRoomPosition: RoomPosition = new RoomPosition(25, 25, targetRoom.name);

        // Loop over owned rooms, finding the shortest path
        for (const currentRoom of ownedRooms) {

            if (!shortestPathRoom) {
                shortestPathRoom = currentRoom;
                continue;
            }

            const shortestRoomPosition: RoomPosition = new RoomPosition(25, 25, shortestPathRoom.name);
            const currentRoomPosition: RoomPosition = new RoomPosition(25, 25, currentRoom.name);

            const shortestPathLength: number = targetRoom.findPath(
                targetRoomPosition,
                shortestRoomPosition,
                { ignoreCreeps: true, ignoreDestructibleStructures: true, ignoreRoads: true }
            ).length;

            const currentPathLength: number = targetRoom.findPath(
                targetRoomPosition,
                currentRoomPosition,
                { ignoreCreeps: true, ignoreDestructibleStructures: true, ignoreRoads: true }
            ).length;

            // If the path is shorter, its the new canidate room
            if (currentPathLength < shortestPathLength) {
                shortestPathRoom = currentRoom;
            }
        }

        // Throw exception if no rooms were found
        if (!shortestPathRoom) {
            throw new UserException(
                "Auto-Dependent Room Finder Error",
                "No room with shortest path found to the target room.",
                ERROR_WARN
            );
        }

        return shortestPathRoom!.name;
    }

    /**
     * Manually get the dependent room based on flags
     * @param targetRoom the room we want to support
     * @param overrideFlag the flag for the selected override flag
     */
    public static findDependentRoomManual(targetRoom: Room, overrideFlag: Flag): string {

        // Throw error if we have no vision in the override flag room
        // (Shouldn't happen, but user error can allow it to occur)
        if (!Game.flags[overrideFlag.name].room) {
            throw new UserException(
                "Manual Dependent Room Finding Error",
                "We have no vision in the room you attempted to manually set as override dependent room.",
                ERROR_ERROR
            );
        }
        return Game.flags[overrideFlag.name].room!.name;
    }

    /**
     * if a claim room has no flags associated with it, delete the claim room memory structure
     * @param claimRooms an array of all the claim room memory structures in the empire
     */
    public static cleanDeadClaimRooms(claimRooms: Array<ClaimRoomMemory | undefined>): void {

        // Loop over attack rooms, and if we find one with no associated flag, remove it
        for (const claimRoom in claimRooms) {
            if (claimRooms[claimRoom]!.flags.data.length === 0) {
                delete claimRooms[claimRoom];
            }
        }
    }

    /**
     * removes all claim room memory structures that do not have an existing flag associated with them
     * @param claimRooms an array of all the claim room memory structures in the empire
     */
    public static cleanDeadClaimRoomFlags(claimRooms: Array<ClaimRoomMemory | undefined>): void {

        // Loop over claim rooms, remote rooms, and attack rooms, and make sure the flag they're referencing actually exists
        // Delete the memory structure if its not associated with an existing flag
        for (const claimRoom of claimRooms) {
            for (const flag in claimRoom!.flags.data) {

                // Tell typescript that these are claim flag memory structures
                const currentFlag: ClaimFlagMemory = claimRoom!.flags.data[flag] as ClaimFlagMemory;
                if (!Game.flags[currentFlag.flagName]) {
                    delete claimRoom!.flags.data[flag];
                }
            }
        }
    }

    /**
     * if an attack room has no flags associated with it, delete the attack room memory structure
     * @param attackRooms an array of all the attack room memory structures in the empire
     */
    public static cleanDeadAttackRooms(attackRooms: Array<AttackRoomMemory | undefined>): void {

        // Loop over attack rooms, and if we find one with no associated flag, remove it
        for (const attackRoom in attackRooms) {
            if (attackRooms[attackRoom]!.flags.data.length === 0) {
                delete attackRooms[attackRoom];
            }
        }
    }

    /**
     * clean dead attack room flags from a live attack room
     */
    public static cleanDeadAttackRoomFlags(attackRooms: Array<AttackRoomMemory | undefined>): void {

        // Loop over attack rooms, and make sure the flag they're referencing actually exists
        // Delete the memory structure if its not associated with an existing flag
        for (const attackRoom of attackRooms) {
            for (const flag in attackRoom!.flags.data) {

                // Tell typescript that these are claim flag memory structures
                const currentFlag: AttackFlagMemory = attackRoom!.flags.data[flag] as AttackFlagMemory;
                if (!Game.flags[currentFlag.flagName]) {
                    delete attackRoom!.flags.data[flag];;
                }
            }
        }
    }

    /**
     * if an remote room has no flags associated with it, delete the attack room memory structure
     * @param attackRooms an array of all the attack room memory structures in the empire
     */
    public static cleanDeadRemoteRooms(remoteRooms: Array<RemoteRoomMemory | undefined>): void {

        // Loop over remote rooms, and if we find one with no associated flag, remove it
        for (const remoteRoom in remoteRooms) {
            if (remoteRooms[remoteRoom]!.flags.data.length === 0) {
                delete remoteRooms[remoteRoom];
            }
        }
    }

    /**
     * removes all claim room memory structures that do not have an existing flag associated with them
     * @param claimRooms an array of all the claim room memory structures in the empire
     */
    public static cleanDeadRemoteRoomsFlags(remoteRooms: Array<RemoteRoomMemory | undefined>): void {

        // Loop over remote rooms and make sure the flag they're referencing actually exists
        // Delete the memory structure if its not associated with an existing flag
        for (const remoteRoom of remoteRooms) {
            for (const flag in remoteRoom!.flags.data) {

                // Tell typescript that these are claim flag memory structures
                const currentFlag: RemoteFlagMemory = remoteRoom!.flags.data[flag] as RemoteFlagMemory;
                if (!Game.flags[currentFlag.flagName]) {
                    delete remoteRoom!.flags.data[flag];
                }
            }
        }
    }
}
import {
    MemoryApi,
    WALL_LIMIT,
    ERROR_WARN,
    STIMULATE_FLAG,
    UserException,
    TOWER_ALLOWED_TO_REPAIR,
    CreepHelper,
    TOWER_MIN_DAMAGE_THRESHOLD,
    SpawnHelper,
    TOWER_MAX_DAMAGE_THRESHOLD
} from "utils/internals";

// helper functions for rooms
export class RoomHelper {
    /**
     * check if a specified room is owned by you
     * @param room the room we want to check
     */
    public static isOwnedRoom(room: Room): boolean {
        if (room.controller !== undefined) {
            return room.controller.my;
        } else {
            return false;
        }
    }

    /**
     * check if a specified room is an ally room
     * @param room the room we want to check
     */
    public static isAllyRoom(room: Room): boolean {
        // returns true if a room has one of our names or is reserved by us
        if (room.controller === undefined) {
            return false;
        } else if (
            room.controller.owner !== undefined &&
            (room.controller.owner.username === "UhmBrock" || room.controller.owner.username === "jakesboy2")
        ) {
            return true;
        } else if (this.isAllyReserved(room)) {
            return true;
        }

        return false;
    }

    /**
     * Check if a room is reserved by an ally
     * @param room the room we are checking the reservation for
     */
    public static isAllyReserved(room: Room): boolean {
        if (!room || !room.controller) {
            return false;
        }
        return (
            room.controller.reservation !== undefined &&
            room.controller.reservation.username !== undefined &&
            (room.controller.reservation!.username === "UhmBrock" ||
                room.controller.reservation!.username === "jakesboy2")
        );
    }

    /**
     * check if a room is a source keeper room
     * @param room the room we want to check
     */
    public static isSourceKeeperRoom(room: Room): boolean {
        // Contains x pos in [1], y pos in [2]
        const parsedName: any = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(room.name);
        const xOffset = parsedName[1] % 10;
        const yOffset = parsedName[2] % 10;
        // If x & y === 5 it's not SK, but both must be between 4 and 6
        const isSK =
            !(xOffset === 5 && xOffset === 5) && (xOffset >= 4 && xOffset <= 6) && (yOffset >= 4 && yOffset <= 6);
        return isSK;
    }

    /**
     * check if a room is a highway room
     * @param room the room we want to check
     */
    public static isHighwayRoom(room: Room): boolean {
        // Contains x pos in [1], y pos in [2]
        const parsedName: any = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(room.name);
        // If x || y is divisible by 10, it's a highway
        if (parsedName[1] % 10 === 0 || parsedName[2] % 10 === 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * check if a room is close enough to send a creep to
     * @param room the room we want to check
     */
    public static inTravelRange(homeRoom: string, targetRoom: string): boolean {
        const routeArray: Array<{ exit: ExitConstant; room: string }> = Game.map.findRoute(
            homeRoom,
            targetRoom
        ) as Array<{ exit: ExitConstant; room: string }>;
        return routeArray.length < 20;
    }

    /**
     * check if the object exists within a room
     * @param room the room we want to check
     * @param objectConst the object we want to check for
     */
    public static isExistInRoom(room: Room, objectConst: StructureConstant): boolean {
        return MemoryApi.getStructures(room.name, s => s.structureType === objectConst).length > 0;
    }

    /**
     * get the stored amount from the target
     * @param target the target we want to check the storage of
     * @param resourceType the resource we want to check the storage for
     */
    public static getStoredAmount(target: any, resourceType: ResourceConstant): number | undefined {
        if (target instanceof Creep) {
            return target.carry[resourceType];
        } else if (target.hasOwnProperty("store")) {
            return target.store[resourceType];
        } else if (resourceType === RESOURCE_ENERGY && target.hasOwnProperty("energy")) {
            return target.energy;
        }
        // Throw an error to identify when this fail condition is met
        throw new UserException(
            "Failed to getStoredAmount of a target",
            "ID: " + target.id + "\n" + JSON.stringify(target),
            ERROR_ERROR
        );
    }

    /**
     * get the capacity from the target
     * @param target the target we want to check the capacity of
     */
    public static getStoredCapacity(target: any): number {
        if (target instanceof Creep) {
            return target.carryCapacity;
        } else if (target.hasOwnProperty("store")) {
            return target.storeCapacity;
        } else if (target.hasOwnProperty("energyCapacity")) {
            return target.energyCapacity;
        }

        return -1;
    }

    /**
     * Calculate the tower scale (portion of damage/heal/repair) at the range to target
     * @param distance The number of tiles away the target is
     */
    public static getTowerRangeScaleFactor(distance: number): number {
        if (distance <= TOWER_OPTIMAL_RANGE) {
            return 1;
        }

        if (distance >= TOWER_FALLOFF_RANGE) {
            return 1 - TOWER_FALLOFF;
        }

        // Falloff is linear between optimal range and maximum range
        const scaleDifferencePerTile = TOWER_FALLOFF / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE);

        // Fall off does not start until after optimal range
        return 1 - (distance - TOWER_OPTIMAL_RANGE) * scaleDifferencePerTile;
    }

    /**
     * Get the amount of damage a tower will do at this distance
     * @param distance The number of tiles away the target is
     * @param healParts [Optional] The number of heal parts to calculate against
     * @param rangedHeal [Optional] Whether or not to use rangedHeal calculation instead of direct heal
     */
    public static getTowerDamageAtRange(distance: number, healParts = 0, rangedHeal = false) {
        // Base Calculation for tower damage
        const attackPower = Math.floor(TOWER_POWER_ATTACK * this.getTowerRangeScaleFactor(distance));

        if (healParts < 0) {
            throw new UserException(
                "Incorrect Arguments for getTowerDamageAtRange",
                "Attempted to pass a negative number of heal parts to function.",
                ERROR_WARN
            );
        }

        let healPower: number;

        if (rangedHeal) {
            healPower = healParts * RANGED_HEAL_POWER;
        } else {
            // direct/melee heal
            healPower = healParts * HEAL_POWER;
        }

        return attackPower - healPower;
    }

    /**
     * Get the amount of damage a tower will heal at this distance
     * @param distance The number of tiles away the target is
     */
    public static getTowerHealAtRange(distance: number) {
        return Math.floor(TOWER_POWER_HEAL * this.getTowerRangeScaleFactor(distance));
    }

    /**
     * Get the amount of damage a tower will repair at this distance
     * @param distance The number of tiles away the target is
     */
    public static getTowerRepairAtRange(distance: number) {
        return Math.floor(TOWER_POWER_REPAIR * this.getTowerRangeScaleFactor(distance));
    }

    /**
     * only returns true every ${parameter} number of ticks
     * @param ticks the number of ticks you want between executions
     */
    public static excecuteEveryTicks(ticks: number): boolean {
        return Game.time % ticks === 0;
    }

    /**
     * check if container mining is active in a room (each source has a container in range)
     * @param room the room we are checking
     * @param sources the sources we are checking
     * @param containers the containers we are checking
     */
    public static isContainerMining(
        room: Room,
        sources: Array<Source | null>,
        containers: Array<Structure<StructureConstant> | null>
    ): boolean {
        // Loop over sources and make sure theres at least one container in range to it
        let numMiningContainers: number = 0;

        _.forEach(sources, (source: Source) => {
            if (_.some(containers, (container: StructureContainer) => source.pos.inRangeTo(container.pos, 2))) {
                numMiningContainers++;
            }
        });

        return numMiningContainers === sources.length;
    }

    /**
     * check if the link is an upgrader link
     * @param room the room we are checking
     * @param sources the sources we are checking
     * @param containers the containers we are checking
     */
    public static getUpgraderLink(room: Room): Structure<StructureConstant> | null {
        // Throw warning if we do not own this room
        if (!this.isOwnedRoom(room)) {
            throw new UserException(
                "Stimulate flag check on non-owned room",
                "You attempted to check for a stimulate flag in a room we do not own. Room [" + room.name + "]",
                ERROR_WARN
            );
        }

        const links: Array<Structure<StructureConstant>> = MemoryApi.getStructureOfType(room.name, STRUCTURE_LINK);
        const controller: StructureController | undefined = room.controller;

        // Break early if we don't have 3 links yet
        if (links.length < 2) {
            return null;
        }

        // Make sure theres a controller in the room
        if (!controller) {
            throw new UserException(
                "Tried to getUpgraderLink of a room with no controller",
                "Get Upgrader Link was called for room [" +
                    room.name +
                    "]" +
                    ", but theres no controller in this room.",
                ERROR_WARN
            );
        }

        // Find the closest link to the controller, this is our upgrader link
        const closestLink: Structure<StructureConstant> | null = controller!.pos.findClosestByRange(links) as Structure<
            StructureConstant
        >;
        return controller.pos.inRangeTo(closestLink.pos.x, closestLink.pos.y, 3) ? closestLink : null;
    }

    /**
     * Check and see if an upgrader link exists
     * @param room the room we are checking for
     */
    public static isUpgraderLink(room: Room): boolean {
        // Throw warning if we do not own this room
        if (!this.isOwnedRoom(room)) {
            throw new UserException(
                "Stimulate flag check on non-owned room",
                "You attempted to check for a stimulate flag in a room we do not own. Room [" + room.name + "]",
                ERROR_WARN
            );
        }

        return this.getUpgraderLink(room) !== null;
    }

    /**
     * Check if the stimulate flag is present for a room
     * @param room the room we are checking for
     */
    public static isStimulateRoom(room: Room): boolean {
        // Throw warning if we do not own this room
        if (!this.isOwnedRoom(room)) {
            throw new UserException(
                "Stimulate flag check on non-owned room",
                "You attempted to check for a stimulate flag in a room we do not own. Room [" + room.name + "]",
                ERROR_WARN
            );
        }

        const terminal: StructureTerminal | undefined = room.terminal;
        // Check if we have a stimulate flag with the same room name as this flag
        return _.some(Memory.flags, (flag: FlagMemory) => {
            if (flag.flagType === STIMULATE_FLAG) {
                return Game.flags[flag.flagName].pos.roomName === room.name && terminal !== undefined;
            }
            return false;
        });
    }

    /**
     *
     * @param room The room to find the target for
     */
    public static chooseTowerAttackTarget(room: Room): Creep | null {
        // All hostiles
        const hostileCreeps = MemoryApi.getHostileCreeps(room.name);

        // Quit early if no creeps
        if (hostileCreeps.length === 0) {
            return null;
        }

        // Take out creeps with heal parts
        const healCreeps = _.remove(hostileCreeps, (c: Creep) => CreepHelper.bodyPartExists(c, HEAL));

        // Take out creeps that can attack
        const attackCreeps = _.remove(hostileCreeps, (c: Creep) =>
            CreepHelper.bodyPartExists(c, ATTACK, RANGED_ATTACK)
        );

        // rename for clarity, all creeps leftover should be civilian
        // TODO Make a case for work part / claim part creeps?
        const civilianCreeps = hostileCreeps;

        // All towers in the room
        // const towers = MemoryApi.getStructureOfType(room.name, STRUCTURE_TOWER, (tower: StructureTower) => tower.store[RESOURCE_ENERGY] > 0);
        const towers = MemoryApi.getStructureOfType(
            room.name,
            STRUCTURE_TOWER,
            (tower: StructureTower) => tower.energy > 0
        ) as StructureTower[];

        if (healCreeps.length === 0) {
            return this.getBestTowerAttackTarget_NoHeal(towers, attackCreeps);
        }

        if (attackCreeps.length > 0) {
            // Target using heal creeps and attack creeps, ignore civilian creeps
            return this.getBestTowerAttackTarget_IncludeHeal(towers, healCreeps, attackCreeps);
        }

        // Target Heal creeps and civilian creeps if there are no attack creeps
        return this.getBestTowerAttackTarget_IncludeHeal(towers, healCreeps, civilianCreeps);
    }

    /**
     * Get the best target for towers, not considering heal parts
     * @param hostiles Array of hostile creeps
     * @param towers Array of friendly towers
     */
    public static getBestTowerAttackTarget_NoHeal(towers: StructureTower[], hostiles: Creep[]): Creep | null {
        let bestTarget: Creep | null = null;
        let bestDamage: number = 0;

        _.forEach(hostiles, (c: Creep) => {
            const distance = this.getAverageDistanceToTarget(towers, c);
            const damage = this.getTowerDamageAtRange(distance);

            if (damage > bestDamage) {
                bestTarget = c;
                bestDamage = damage;
            }
        });

        if (
            (bestDamage >= TOWER_MIN_DAMAGE_THRESHOLD && towers[0].room.memory.shotLastTick === true) ||
            bestDamage >= TOWER_MAX_DAMAGE_THRESHOLD
        ) {
            return bestTarget;
        } else {
            return null;
        }
    }

    /**
     * Get the best target for towers, taking their ability to heal into account
     * @param healHostiles Array of hostile creeps that can heal
     * @param otherHostiles Array of hostile creeps that can't heal
     * @param towers Array of friendly towers
     */
    public static getBestTowerAttackTarget_IncludeHeal(
        towers: StructureTower[],
        healHostiles: Creep[],
        otherHostiles?: Creep[]
    ): Creep | null {
        // Get the amount of healing each creep can receive
        const creepHealData: Array<{ creep: Creep; healAmount: number }> = this.getCreepHealData(
            healHostiles,
            otherHostiles
        );

        // TODO Maybe make it consider the creep with

        // Get best creep (least ability to heal)
        // TODO add a situation to handle equal heal amounts, to break the tie
        let bestTarget = null;
        let bestDamage = 0;

        for (const data of creepHealData) {
            // Get distance / damage to target
            const avgDistanceToTower = this.getAverageDistanceToTarget(towers, data.creep);
            const towerDamageToTarget = this.getTowerDamageAtRange(avgDistanceToTower);

            // Get damage after all possible healing has been applied
            const netDamage = towerDamageToTarget - data.healAmount;

            // If this is better than our last target, choose it
            if (bestDamage < netDamage) {
                bestTarget = data.creep;
                bestDamage = netDamage;
            }
        }

        // If we shot last tick, netDamage >= min damage, else netDamage >= max damage
        if (
            (bestDamage >= TOWER_MIN_DAMAGE_THRESHOLD && towers[0].room.memory.shotLastTick === true) ||
            bestDamage >= TOWER_MAX_DAMAGE_THRESHOLD
        ) {
            return bestTarget;
        } else {
            return null;
        }
    }

    public static getCreepHealData(
        healHostiles: Creep[],
        otherHostiles?: Creep[]
    ): Array<{ creep: Creep; healAmount: number }> {
        const hostiles: Creep[] = otherHostiles === undefined ? healHostiles : healHostiles.concat(otherHostiles);

        const creepHealData: Array<{ creep: Creep; healAmount: number }> = [];

        // Loop through each creep and get heal amount
        // Each heal creep will consider healing itself as well as any other creep to cover worst-case scenario
        for (const creep of hostiles) {
            let healAmount = 0;

            // Loop through all healers to find which can affect this creep and by how much
            for (const healer of healHostiles) {
                const distance = creep.pos.getRangeTo(healer);
                // skip if creep is too far to heal
                if (distance > 3) {
                    continue;
                } // Creep is not able to heal() and must use rangedHeal()
                else if (distance > 1) {
                    healAmount += healer.getActiveBodyparts(HEAL) * RANGED_HEAL_POWER;
                } // Creep can use heal()
                else {
                    healAmount += healer.getActiveBodyparts(HEAL) * HEAL_POWER;
                }
            }

            creepHealData.push({ creep, healAmount });
        }

        return creepHealData;
    }

    /**
     * Search for the ideal repair target for the tower
     * @param room the room we are searching for repair targets in
     */
    public static chooseTowerTargetRepair(room: Room): Structure | undefined | null {
        // Check for non-priority repair jobs of an allowed type
        const repairJobs = MemoryApi.getRepairJobs(
            room,
            (j: WorkPartJob) => j.targetType === STRUCTURE_CONTAINER || j.targetType === STRUCTURE_ROAD
        );

        if (repairJobs.length > 0) {
            return Game.getObjectById(repairJobs[0].targetID) as Structure;
        }

        return undefined;
    }

    /**
     * Decide if a structure type is allowed for the tower to repair
     * @param target the target we are checking for
     */
    public static isTowerAllowedToRepair(structureType: StructureConstant): boolean {
        for (const i in TOWER_ALLOWED_TO_REPAIR) {
            const currentStructureType = TOWER_ALLOWED_TO_REPAIR[i];
            if (currentStructureType === structureType) {
                return true;
            }
        }
        return false;
    }

    /**
     * Gets the average distance from the array of objects to a target
     * @param fromPoints An array of objects that have a pos property
     * @param target An object with a pos property
     */
    public static getAverageDistanceToTarget(fromPoints: _HasRoomPosition[], target: _HasRoomPosition) {
        const totalDistance = _.sum(fromPoints, (point: _HasRoomPosition) => point.pos.getRangeTo(target.pos));
        return totalDistance / fromPoints.length;
    }

    // Get the number of non-terrain-wall tiles around a RoomObject
    public static getNumAccessTilesForTarget(target: RoomObject): number {
        let accessibleTiles = 0;
        const roomTerrain: RoomTerrain = new Room.Terrain(target.pos.roomName);
        for (let y = target.pos.y - 1; y <= target.pos.y + 1; y++) {
            for (let x = target.pos.x - 1; x <= target.pos.x + 1; x++) {
                if (target.pos.x === x && target.pos.y === y) {
                    continue;
                }
                if (roomTerrain.get(x, y) !== TERRAIN_MASK_WALL) {
                    accessibleTiles++;
                }
            }
        }
        return accessibleTiles;
    }

    /**
     * Get the difference in Wall/Rampart HP between the current and previous RCL
     * @param controllerLevel the level of the controller in the room
     */
    public static getWallLevelDifference(controllerLevel: number): number {
        return WALL_LIMIT[controllerLevel] - WALL_LIMIT[controllerLevel - 1];
    }

    /**
     * Returns the number of hostile creeps recorded in the room
     * @param room The room to check
     */
    public static numHostileCreeps(room: Room): number {
        const hostiles = MemoryApi.getHostileCreeps(room.name);
        return hostiles.length;
    }
    /**
     * Return the number of remote rooms associated with the given room
     * @param room
     */
    public static numRemoteRooms(room: Room): number {
        const remoteRooms = MemoryApi.getRemoteRooms(room);
        return remoteRooms.length;
    }

    /**
     * get number of associated claim rooms
     * @param room
     */
    public static numClaimRooms(room: Room): number {
        const claimRooms = MemoryApi.getClaimRooms(room);
        return claimRooms.length;
    }

    /**
     * get number of associated attack rooms
     * @param room
     */
    public static numAttackRooms(room: Room): number {
        const attackRooms = MemoryApi.getAttackRooms(room);
        return attackRooms.length;
    }

    /**
     * Returns the number of sources in a room
     * @param room The room to check
     */
    public static numSources(room: Room): number {
        return Memory.rooms[room.name].sources.data.length;
    }
    /**
     * Returns the number of sources in all remoteRooms connected to room
     * @param room The room to check the remoteRooms of
     */
    public static numRemoteSources(room: Room): number {
        // TODO: Fix this to use remote room name memory which contains the actual source reference
        // TODO: remove sources and structures from the remote room dependent memory itself
        const remoteRooms: RemoteRoomMemory[] = Memory.rooms[room.name].remoteRooms!;
        let numSources: number = 0;

        _.forEach(remoteRooms, (rr: RemoteRoomMemory) => {
            if (!rr) {
                return;
            }
            // Don't consider these sources valid if the controller is reserved by an enemy, or theres defcon 2 >=
            if (
                SpawnHelper.isRemoteRoomEnemyReserved(rr) ||
                (Memory.rooms[rr.roomName] && Memory.rooms[rr.roomName].defcon >= 2)
            ) {
                return;
            }

            let sourcesInRoom: number = 0;
            if (
                Memory.rooms[rr.roomName] &&
                Memory.rooms[rr.roomName].sources &&
                Memory.rooms[rr.roomName].sources.data
            ) {
                sourcesInRoom = Memory.rooms[rr.roomName].sources.data.length;
            } else {
                sourcesInRoom = rr.sources.data;
            }
            numSources += sourcesInRoom;
        });
        return numSources;
    }

    /**
     * get number of remote defenders we need
     * @param room The room to check the dependencies of
     */
    public static numRemoteDefenders(room: Room): number {
        const remoteRooms: RemoteRoomMemory[] = Memory.rooms[room.name].remoteRooms!;
        let numRemoteDefenders: number = 0;

        _.forEach(remoteRooms, (rr: RemoteRoomMemory) => {
            if (!rr) {
                return;
            }

            // If there are any hostile creeps, add one to remoteDefenderCount
            // Get hostile creeps in the remote room
            const defconLevel = Memory.rooms[rr.roomName].defcon;
            if (defconLevel >= 2) {
                numRemoteDefenders++;
            }
        });

        return numRemoteDefenders;
    }

    /**
     * get the number of claim rooms that have not yet been claimed
     * @param room the room we are checking for
     */
    public static numCurrentlyUnclaimedClaimRooms(room: Room): number {
        const allClaimRooms: Array<ClaimRoomMemory | undefined> = MemoryApi.getClaimRooms(room);
        const ownedRooms: Room[] = MemoryApi.getOwnedRooms();
        let sum: number = 0;

        // No existing claim rooms
        if (allClaimRooms[0] === undefined) {
            return 0;
        }

        for (const claimRoom of allClaimRooms) {
            if (
                !_.some(ownedRooms, ownedRoom => {
                    if (claimRoom) {
                        return room.name === claimRoom!.roomName;
                    }
                    return false;
                })
            ) {
                ++sum;
            }
        }

        return sum;
    }

    /**
     * get the number of domestic defenders by the defcon number
     * @param defcon the defcon level of the room
     * @param isTowers boolean representing if tower exists in room
     * @returns the number of defenders to spawn
     */
    public static getDomesticDefenderLimitByDefcon(defcon: number, isTowers: boolean): number {
        switch (defcon) {
            case 2:
                return isTowers === true ? 0 : 2;
            case 3:
                return isTowers === true ? 0 : 2;
            case 4:
                return isTowers === true ? 1 : 2;
        }
        return 0;
    }

    /**
     * convert a room object to a room position object
     * @param roomObj the room object we are converting
     */
    public static convertRoomObjToRoomPosition(roomObj: RoomObject): RoomPosition | null {
        if (roomObj.room === undefined) {
            return null;
        }
        const x: number = roomObj.pos.x;
        const y: number = roomObj.pos.y;
        const roomName: string = roomObj.room!.name;
        return new RoomPosition(x, y, roomName);
    }

    /**
     * check if the first room is a remote room of the second
     */
    public static isRemoteRoomOf(dependentRoomName: string, hostRoomName?: string): boolean {
        // early returns
        if (!hostRoomName) {
            const ownedRooms: Room[] = MemoryApi.getOwnedRooms();
            for (const room of ownedRooms) {
                const remoteRooms: RemoteRoomMemory[] = MemoryApi.getRemoteRooms(room);
                if (_.some(remoteRooms, (rr: RemoteRoomMemory) => rr.roomName === dependentRoomName)) {
                    return true;
                }
            }
            return false;
        }
        if (!Memory.rooms[hostRoomName]) {
            return false;
        }
        if (!Game.rooms[hostRoomName]) {
            return false;
        }

        const remoteRooms: RemoteRoomMemory[] = MemoryApi.getRemoteRooms(Game.rooms[hostRoomName]);
        return _.some(remoteRooms, (rr: RemoteRoomMemory) => rr.roomName === dependentRoomName);
    }

    /**
     * verify that the object exists in the game
     * @param id the id we are checking for
     * @returns if the object exists
     */
    public static verifyObjectByID(id: string): boolean {
        return Game.getObjectById(id) !== undefined;
    }

    /**
     * Check if a room has no reservation on it
     * @param room the room we are checking
     */
    public static isNoReservation(room: Room): boolean {
        if (room.controller) {
            return room.controller.reservation === undefined;
        }
        return false;
    }
}

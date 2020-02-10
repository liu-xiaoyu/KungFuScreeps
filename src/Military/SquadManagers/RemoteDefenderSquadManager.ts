import {
    UserException,
    REMOTE_DEFENDER_MAN,
    SpawnApi,
    ROLE_STALKER,
    MemoryApi_Military,
    SQUAD_STATUS_OK,
    HIGH_PRIORITY,
    OP_STRATEGY_COMBINED,
    OP_STRATEGY_FFA,
    SQUAD_STATUS_DEAD,
    MilitaryCombat_Api,
    militaryDataHelper,
    ACTION_MOVE,
    MilitaryMovment_Api,
    ACTION_RANGED_ATTACK,
    ACTION_HEAL,
    SQUAD_STATUS_RALLY,
    SQUAD_STATUS_DONE
} from "Utils/Imports/internals";

export class RemoteDefenderSquadManager implements ISquadManager {
    public name: SquadManagerConstant = REMOTE_DEFENDER_MAN;
    public creeps: SquadStack[] = [];
    public targetRoom: string = "";
    public squadUUID: string = "";
    public operationUUID: string = "";
    public initialRallyComplete: boolean = false;
    public rallyPos: MockRoomPos | undefined;

    constructor() {
        const self = this;
        self.runSquad = self.runSquad.bind(this);
        self.createInstance = self.createInstance.bind(this);
        self.getSquadArray = self.getSquadArray.bind(this);
        self.checkStatus = self.checkStatus.bind(this);
        self.addCreep = self.addCreep.bind(this);
        self.creeps = [];
    }

    /**
     * Run the squad manager
     * @param instance the speecific instance of the squad we're running
     */
    public runSquad(instance: ISquadManager): void {
        const operation = MemoryApi_Military.getOperationByUUID(instance.operationUUID);
        const squadImplementation = this.getSquadStrategyImplementation(operation!);

        // Run the specific strategy for the current operation
        squadImplementation.runSquad(instance);

    }

    /**
     * Returns the implementation object for the squad
     * @param operation The parent operation of the squad
     */
    public getSquadStrategyImplementation(operation: MilitaryOperation): SquadStrategyImplementation {
        switch (operation.operationStrategy) {
            case OP_STRATEGY_COMBINED: return this[OP_STRATEGY_COMBINED];
            case OP_STRATEGY_FFA: return this[OP_STRATEGY_FFA];
            default: return this[OP_STRATEGY_FFA];
        }
    }

    /**
     * Create an instance and place into the empire memory
     * @param targetRoom the room we are attacking
     */
    public createInstance(targetRoom: string, operationUUID: string): RemoteDefenderSquadManager {
        const uuid: string = SpawnApi.generateSquadUUID(operationUUID);
        const instance = new RemoteDefenderSquadManager();
        instance.squadUUID = uuid;
        instance.targetRoom = targetRoom;
        instance.operationUUID = operationUUID;
        instance.initialRallyComplete = false;
        instance.rallyPos = undefined;
        return instance;
    }

    /**
     * Add a creep to the class
     * @param creep the creep we are adding to the squad
     * @param instance the speecific instance of the squad we're running
     */
    public addCreep(instance: ISquadManager, creepName: string): void {
        MemoryApi_Military.addCreepToSquad(instance.operationUUID, instance.squadUUID, creepName);
    }

    /**
     * Check the status of the squad
     * @param instance the speecific instance of the squad we're running
     * @returns boolean representing the squads current status
     */
    public checkStatus(instance: ISquadManager): SquadStatusConstant {
        // Handle initial rally status
        if (!instance.initialRallyComplete) {
            if (MilitaryMovment_Api.isSquadRallied(instance)) {
                instance.initialRallyComplete = true;
                return SQUAD_STATUS_OK;
            }
            return SQUAD_STATUS_RALLY;
        }

        // Check if the squad is done with the attack (ie, attack success)
        if (MilitaryCombat_Api.isOperationDone(instance)) {
            return SQUAD_STATUS_DONE;
        }

        // Check if the squad was killed
        if (MilitaryCombat_Api.isSquadDead(instance)) {
            return SQUAD_STATUS_DEAD;
        }

        // If nothing else, we are OK
        return SQUAD_STATUS_OK;
    }

    /**
     * Gets the members of the squad in array form
     * @returns array containing all squad member's role constants
     */
    public getSquadArray(): SquadDefinition[] {
        const stalker1: SquadDefinition = {
            role: ROLE_STALKER,
            caravanPos: 0
        };
        return [stalker1];
    }

    /**
     * Get the spawn priority of the military squad
     */
    public getSpawnPriority(): number {
        return HIGH_PRIORITY;
    }


    /**
     * Implementation of OP_STRATEGY_FFA
     */
    public ffa = {

        runSquad(instance: ISquadManager): void {
            // find squad implementation
            const singleton: ISquadManager = MemoryApi_Military.getSingletonSquadManager(instance.name);
            const status: SquadStatusConstant = singleton.checkStatus(instance);
            const creeps: Creep[] = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance);

            // Anything else besides OK and we idle
            if (status === SQUAD_STATUS_DEAD) {
                delete Memory.empire.militaryOperations[instance.operationUUID].squads[instance.squadUUID];
                return;
            }

            const roomData: MilitaryDataAll = this.getRoomData(creeps);

            this.resetSquadIntents(instance, status, roomData);
            this.decideMoveIntents(instance, status, roomData);
            this.decideRangedAttackIntents(instance, status, roomData);
            this.decideHealIntents(instance, status, roomData);

            for (const i in creeps) {
                const creep: Creep = creeps[i];
                MilitaryCombat_Api.runIntents(instance, creep, roomData);
            }
        },

        getRoomData(creeps: Creep[]): MilitaryDataAll {
            const roomData: MilitaryDataAll = {};

            _.forEach(creeps, (creep: Creep) => {
                const roomName = creep.room.name;

                if (roomData[roomName] === undefined) {
                    roomData[roomName] = {};
                }

                roomData[roomName].hostiles = militaryDataHelper.getHostileCreeps(roomName);
            });

            return roomData;
        },

        resetSquadIntents(instance: ISquadManager, status: SquadStatusConstant, roomData: MilitaryDataAll): void {
            const creeps = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance);

            _.forEach(creeps, (creep: Creep) => {
                const creepStack = MemoryApi_Military.findCreepInSquadByInstance(instance, creep.name);

                if (creepStack === undefined) {
                    return;
                }

                creepStack.intents = [];
            });
        },

        decideMoveIntents(instance: ISquadManager, status: SquadStatusConstant, roomData: MilitaryDataAll): void {
            // If status === RALLY {   // code here }
            if (status !== SQUAD_STATUS_OK) {
                throw new UserException(
                    "Unhandled status in DomesticDefenderSquadManager.FFA.decideMoveIntents",
                    "Status: " + status + "\nCheck that this status is being handled appropriately.",
                    ERROR_ERROR
                );
            }

            if (!roomData[instance.targetRoom]?.hostiles) {
                return;
            }

            // Get objective
            // if rcl < 4, objective is to seek and destroy
            // get every creep onto the nearest rampart to the enemy closest to the center of bunker?
            const creeps = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance);
            const hostiles: Creep[] | undefined = roomData[instance.targetRoom].hostiles?.allHostiles;
            const targetHostile: Creep | undefined = MilitaryCombat_Api.getRemoteDefenderAttackTarget(hostiles, creeps, instance.targetRoom);

            _.forEach(creeps, (creep: Creep) => {

                // Try to get off exit tile first, then get a move target based on what room we're in
                let directionToTarget: DirectionConstant | undefined = MilitaryMovment_Api.getDirectionOffExitTile(creep);
                if (!directionToTarget) {
                    if (creep.room.name === instance.targetRoom) {  // in target room
                        if (targetHostile) {
                            if (MilitaryCombat_Api.isInAttackRange(creep, targetHostile.pos, false)) {
                                directionToTarget = MilitaryCombat_Api.getKitingDirection(creep, targetHostile);
                            }
                            else {
                                const closeEnemy: Creep | null = creep.pos.findClosestByPath(hostiles!);
                                if (closeEnemy && MilitaryCombat_Api.isInAttackRange(creep, closeEnemy.pos, false)) {
                                    directionToTarget = MilitaryCombat_Api.getKitingDirection(creep, closeEnemy);
                                }
                                else {
                                    const path = creep.pos.findPathTo(targetHostile.pos, { range: 3 });
                                    directionToTarget = path[0].direction;
                                }
                            }
                        }
                    }
                }
                else {                                          // not in target room
                    const closeEnemy: Creep | null = creep.pos.findClosestByPath(creep.room.find(FIND_HOSTILE_CREEPS));
                    if (closeEnemy && MilitaryCombat_Api.isInAttackRange(creep, closeEnemy.pos, false)) {
                        directionToTarget = MilitaryCombat_Api.getKitingDirection(creep, closeEnemy);
                    }
                    else {
                        const path = creep.pos.findPathTo(new RoomPosition(25, 25, instance.targetRoom), { range: 25 });
                        directionToTarget = path[0].direction;
                    }
                }

                if (!directionToTarget) {
                    return;
                }

                const intent: MiliIntent = {
                    action: ACTION_MOVE,
                    target: directionToTarget,
                    targetType: "direction"
                };

                const creepStack: SquadStack | undefined = MemoryApi_Military.findCreepInSquadByInstance(instance, creep.name);

                if (creepStack === undefined) {
                    return;
                }

                creepStack.intents.push(intent);
            });
        },

        decideRangedAttackIntents(instance: ISquadManager, status: SquadStatusConstant, roomData: MilitaryDataAll): void {

            if (!roomData[instance.targetRoom]?.hostiles) {
                return;
            }

            const creeps = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance);
            const hostiles: Creep[] | undefined = roomData[instance.targetRoom].hostiles?.allHostiles;
            const bestTargetHostile: Creep | undefined = MilitaryCombat_Api.getRemoteDefenderAttackTarget(hostiles, creeps, instance.targetRoom);

            if (!bestTargetHostile) {
                return;
            }

            _.forEach(creeps, (creep: Creep) => {

                if (creep.pos.inRangeTo(bestTargetHostile.pos, 3)) {

                    const intent: MiliIntent = {
                        action: ACTION_RANGED_ATTACK,
                        target: bestTargetHostile.id,
                        targetType: "creep"
                    };

                    MemoryApi_Military.pushIntentToCreepStack(instance, creep.name, intent);
                    return;
                }

                // Find any other attackable creep if we can't hit the best target
                const closestHostileCreep: Creep | undefined = _.find(roomData[instance.targetRoom].hostiles!.allHostiles, (hostile: Creep) => hostile.pos.getRangeTo(creep.pos) <= 3);

                if (closestHostileCreep !== undefined) {
                    const intent: MiliIntent = {
                        action: ACTION_RANGED_ATTACK,
                        target: closestHostileCreep.id,
                        targetType: "creep"
                    };

                    MemoryApi_Military.pushIntentToCreepStack(instance, creep.name, intent);
                    return;
                }
            });
        },

        decideHealIntents(instance: ISquadManager, status: SquadStatusConstant, roomData: MilitaryDataAll): void {

            if (!roomData[instance.targetRoom]?.hostiles) {
                return;
            }
            // Heal yourself every tick, as long as there are hostiles in the room
            const creeps = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance)

            _.forEach(creeps, (creep: Creep) => {

                // Heal if we are below full, preheal if theres hostiles and we aren't under a rampart
                const creepIsOnRampart: boolean = _.filter(creep.pos.lookFor(LOOK_STRUCTURES), (struct: Structure) => struct.structureType === STRUCTURE_RAMPART).length > 0;
                if ((roomData[instance.targetRoom].hostiles!.allHostiles.length > 0 && !creepIsOnRampart) || creep.hits < creep.hitsMax) {

                    const intent: MiliIntent = {
                        action: ACTION_HEAL,
                        target: creep.name,
                        targetType: "creep"
                    };

                    MemoryApi_Military.pushIntentToCreepStack(instance, creep.name, intent);
                    return;
                }
            });

            return;
        }

    }

    /**
     * Implementation of OP_STRATEGY_COMBINED
     */
    public combined = {

        runSquad(instance: ISquadManager): void {
            return;
        }

    }

}

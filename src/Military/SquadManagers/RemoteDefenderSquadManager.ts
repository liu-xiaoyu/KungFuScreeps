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
import { MilitaryStatus_Helper } from "Military/Military.Status.Helper";
import { MilitaryIntents_Api } from "Military/Military.Api.Intents";

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

            const singleton: ISquadManager = MemoryApi_Military.getSingletonSquadManager(instance.name);
            const status: SquadStatusConstant = singleton.checkStatus(instance);
            if (MilitaryStatus_Helper.handleSquadDeadStatus(status, instance)) {
                return;
            }
            MilitaryStatus_Helper.handleNotOKStatus(status);

            const dataNeeded: MilitaryDataParams = {
                hostiles: true
            };
            const creeps: Creep[] = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance);
            const roomData: MilitaryDataAll = militaryDataHelper.getRoomData(creeps, dataNeeded);

            MilitaryIntents_Api.resetSquadIntents(instance);
            this.decideMoveIntents(instance, status, roomData);
            this.decideRangedAttackIntents(instance, status, roomData);
            this.decideHealIntents(instance, status, roomData);

            for (const i in creeps) {
                const creep: Creep = creeps[i];
                MilitaryCombat_Api.runIntents(instance, creep, roomData);
            }
        },

        decideMoveIntents(instance: ISquadManager, status: SquadStatusConstant, roomData: MilitaryDataAll): void {

            if (!roomData[instance.targetRoom]?.hostiles) {
                return;
            }

            // Get objective
            const creeps = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance);

            _.forEach(creeps, (creep: Creep) => {

                // Try to get off exit tile first, then get a move target based on what room we're in
                if (MilitaryIntents_Api.queueIntentMoveOffExitTile(creep, instance)) {
                    return;
                }

                if (creep.room.name === instance.targetRoom) {  // in target room
                    this.decideMoveIntents_TARGET_ROOM(instance, status, roomData, creeps, creep);
                }
                else {                                          // not in target room
                    this.decideMoveIntents_NON_TARGET_ROOM(instance, status, roomData, creeps, creep);
                }
            });
        },

        decideMoveIntents_TARGET_ROOM(instance: ISquadManager, status: SquadStatusConstant, roomData: MilitaryDataAll, creeps: Creep[], creep: Creep): void {
            const hostiles: Creep[] | undefined = roomData[instance.targetRoom].hostiles?.allHostiles;
            const targetHostile: Creep | undefined = MilitaryCombat_Api.getRemoteDefenderAttackTarget(hostiles, creeps, instance.targetRoom);

            if (MilitaryIntents_Api.queueIntentMoveNearHostileKiting(creep, instance)) {
                return;
            }

            if (MilitaryIntents_Api.queueIntentMoveTargetKiting(creep, targetHostile, instance)) {
                return;
            }
        },

        decideMoveIntents_NON_TARGET_ROOM(instance: ISquadManager, status: SquadStatusConstant, roomData: MilitaryDataAll, creeps: Creep[], creep: Creep): void {
            if (MilitaryIntents_Api.queueIntentMoveNearHostileKiting(creep, instance)) {
                return;
            }

            if (MilitaryIntents_Api.queueIntentMoveToTargetRoom(creep, instance)) {
                return;
            }
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

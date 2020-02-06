import {
    UserException,
    DOMESTIC_DEFENDER_MAN,
    SpawnApi,
    ROLE_STALKER,
    MemoryApi_Military,
    SQUAD_STATUS_OK,
    OP_STRATEGY_NONE,
    OP_STRATEGY_COMBINED,
    OP_STRATEGY_FFA,
    HIGH_PRIORITY,
    SQUAD_STATUS_RALLY,
    SQUAD_STATUS_DONE,
    MilitaryMovment_Api,
    MilitaryCombat_Api,
    SQUAD_STATUS_DEAD,
    MemoryApi_Room,
    MemoryApi_Creep
} from "Utils/Imports/internals";

export class DomesticDefenderSquadManager implements ISquadManager {
    public name: SquadManagerConstant = DOMESTIC_DEFENDER_MAN;
    public creeps: string[] = [];
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
    public createInstance(targetRoom: string, operationUUID: string): DomesticDefenderSquadManager {
        const uuid: string = SpawnApi.generateSquadUUID(operationUUID);
        const instance = new DomesticDefenderSquadManager();
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
            const CREEP_RANGE: number = 3;
            const creeps: Creep[] = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance);
            const enemies: Creep[] = MemoryApi_Creep.getHostileCreeps(instance.targetRoom);
            const ramparts: Structure[] = MemoryApi_Room.getStructureOfType(instance.targetRoom, STRUCTURE_RAMPART);

            // Behavior for each creep, all stalkers so no need to split into different behavior
            // But we will want to split into the different roles for other managers, and possible
            // do the same here for the ability to plug and play roles into managers
            for (const i in creeps) {
                const creep: Creep = creeps[i];
                const defenseRampart: Structure | null = MilitaryMovment_Api.findDefenseRampart(creep, enemies, ramparts);
                if (!defenseRampart) {
                    continue;
                }

                // Move to the rampart
                if (!creep.pos.isEqualTo(defenseRampart.pos)) {
                    creep.moveTo(defenseRampart.pos);
                    continue;
                }

                // We're on the rampart, check for enemies in range and fire away
                const target: Creep | null = creep.pos.findClosestByRange(enemies);
                if (!target) {
                    continue;
                }

                if (creep.pos.inRangeTo(target.pos, CREEP_RANGE)) {
                    creep.rangedAttack(target);
                    continue;
                }
            }
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

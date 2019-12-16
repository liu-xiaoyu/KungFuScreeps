import { ROLE_STALKER, CreepMiliApi } from "Utils/Imports/internals";

// Manager for the miner creep role
export class StalkerCreepManager implements IMiliCreepRoleManager {
    public name: RoleConstant = ROLE_STALKER;

    constructor() {
        const self = this;
        self.runCreepRole = self.runCreepRole.bind(this);
    }

    /**
     * run the stalker creep
     * @param creep the creep we are running
     */
    public runCreepRole(creep: Creep): void {
        const creepOptions: CreepOptionsMili = creep.memory.options as CreepOptionsMili;
        const CREEP_RANGE: number = 3;

        // Carry out the basics of a military creep before moving on to specific logic
        if (CreepMiliApi.checkMilitaryCreepBasics(creep, creepOptions)) {
            return;
        }

        // Find a target for the creep
        creepOptions.attackTarget = CreepMiliApi.getAttackTarget(creep, creepOptions, CREEP_RANGE);
        const target: Creep | Structure<StructureConstant> | undefined = creepOptions.attackTarget;
        const isMelee: boolean = false;
        if (!target) {
            // Keep the creeps together in the squad, if they're in a squad
            if (creepOptions.squadUUID) {
                CreepMiliApi.moveCreepToFurthestSquadMember(creep);
            }
            return; // idle if no current target
        }
        // If we aren't in attack range, move towards the attack target
        if (!CreepMiliApi.isInAttackRange(creep, target.pos, isMelee)) {
            creep.moveTo(target);
            return;
        } else {
            CreepMiliApi.kiteEnemyCreep(creep);
        }

        // We are in attack range and healthy, attack the target
        creep.rangedAttack(target);

        // Reset offensive target
        CreepMiliApi.resetOffensiveTarget(creep);
    }
}

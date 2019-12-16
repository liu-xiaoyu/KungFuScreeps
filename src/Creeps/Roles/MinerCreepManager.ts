import { ROLE_MINER, CreepAllHelper, CreepAllApi, MemoryApi } from "Utils/Imports/internals";
import { CreepCivApi } from "Creeps/Creep.Civ.Api";
import { CreepCivHelper } from "Creeps/Creep.Civ.Helper";

// Manager for the miner creep role
export class MinerCreepManager implements ICivCreepRoleManager {
    public name: RoleConstant = ROLE_MINER;

    constructor() {
        const self = this;
        self.getNewJob = self.getNewJob.bind(this);
        self.handleNewJob = self.handleNewJob.bind(this);
    }

    /**
     * get a job for the miner creep
     * @param creep
     * @param room
     */
    public getNewJob(creep: Creep, room: Room): BaseJob | undefined {
        return CreepCivApi.getNewSourceJob(creep, room);
    }

    /**
     * Handle initalizing a new job
     * @param creep the creep we are using
     * @param room the room we are in
     */
    public handleNewJob(creep: Creep, room: Room): void {
        // Update room memory to reflect the new job
        MemoryApi.updateJobMemory(creep, room);

        const isSource: boolean = true;
        const miningContainer = CreepCivHelper.getMiningContainer(
            creep.memory.job as GetEnergyJob,
            Game.rooms[creep.memory.homeRoom],
            isSource
        );

        if (miningContainer === undefined) {
            // Returning here to prevent supplementary id from being formed,
            // so in that case creep will just walk up to the source
            return;
        }

        // Check for any creeps on the miningContainer
        const creepsOnContainer = miningContainer.pos.lookFor(LOOK_CREEPS);

        if (creepsOnContainer.length > 0) {
            // If the creep on the container is a miner (and not some random creep that's in the way)
            if (creepsOnContainer[0].memory.role === ROLE_MINER) {
                return; // Don't target it
            }
        }

        if (creep.memory.supplementary === undefined) {
            creep.memory.supplementary = {};
        }

        creep.memory.supplementary.moveTargetID = miningContainer.id;
    }
}

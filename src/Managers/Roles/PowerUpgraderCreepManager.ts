import { ROLE_POWER_UPGRADER, MemoryApi, CreepApi } from "utils/internals";

// Manager for the miner creep role
export class PowerUpgraderCreepManager implements ICivCreepRoleManager {
    public name: RoleConstant = ROLE_POWER_UPGRADER;

    constructor() {
        const self = this;
        self.getNewJob = self.getNewJob.bind(this);
        self.handleNewJob = self.handleNewJob.bind(this);
    }

    /**
     * Decides which kind of job to get and calls the appropriate function
     */
    public getNewJob(creep: Creep, room: Room): BaseJob | undefined {
        // if creep is empty, get a GetEnergyJob
        if (creep.carry.energy === 0) {
            return this.newGetEnergyJob(creep, room);
        } else {
            // Creep energy > 0
            return this.newUpgradeJob(creep, room);
        }
    }

    /**
     * get an upgrading job
     */
    public newUpgradeJob(creep: Creep, room: Room): WorkPartJob | undefined {
        const creepOptions: CreepOptionsCiv = creep.memory.options as CreepOptionsCiv;
        if (creepOptions.upgrade) {
            // All link jobs with enough energy to fill creep.carry, and not taken
            const upgraderJob = MemoryApi.getUpgradeJobs(room, (job: WorkPartJob) => !job.isTaken);

            if (upgraderJob.length > 0) {
                return upgraderJob[0];
            }

            return undefined;
        }
        return undefined;
    }

    /**
     * Get a GetEnergyJob for the power upgrader
     */
    public newGetEnergyJob(creep: Creep, room: Room): GetEnergyJob | undefined {
        // All link jobs with enough energy to fill creep.carry, and not taken
        const linkJobs = MemoryApi.getLinkJobs(room, (job: GetEnergyJob) => !job.isTaken);

        if (linkJobs.length > 0) {
            return linkJobs[0];
        }

        return undefined;
    }

    /**
     * Handles setup for a new job
     */
    public handleNewJob(creep: Creep, room: Room): void {
        MemoryApi.updateJobMemory(creep, room);
    }
}

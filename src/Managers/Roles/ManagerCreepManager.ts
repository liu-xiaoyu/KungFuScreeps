import { ROLE_MANAGER, MemoryApi, CreepApi } from "utils/internals";

// Manager for the miner creep role
export class ManagerCreepManager implements ICivCreepRoleManager {
    public name: RoleConstant = ROLE_MANAGER;

    constructor() {
        const self = this;
        self.getNewJob = self.getNewJob.bind(this);
        self.handleNewJob = self.handleNewJob.bind(this);
    }

    /**
     * Decides which kind of job to get and calls the appropriate function
     * @param creep the creep we are getting the job for
     * @param room the room we are in
     * @returns BaseJob of the new job we recieved (undefined if none)
     */
    public getNewJob(creep: Creep, room: Room): BaseJob | undefined {

        if (creep.carry.energy === 0) {
            return this.getEnergyJob(creep, room);
        }
        else {
            return this.getCarryJob(creep, room);
        }
    }

    /**
     * Check if theres a job besides just filling the storage
     * @param creep the creep we are checking the job for
     * @param room the room we are in
     * @returns boolean telling us if there is a non storage filling job or not
     */
    private isNonStorageJob(creep: Creep, room: Room): boolean {
        const job: CarryPartJob | undefined = this.getCarryJob(creep, room);
        return (job !== undefined && job.targetType !== STRUCTURE_STORAGE);
    }

    /**
     * Find a job to get energy for the manager
     * @param creep the manager creep we are running
     * @param room the room the creep is in
     */
    private getEnergyJob(creep: Creep, room: Room): BaseJob | undefined {
        const creepOptions: CreepOptionsCiv = creep.memory.options as CreepOptionsCiv;
        // Check for energy in the terminal
        if (creepOptions.getFromTerminal) {
            // All backupStructures with enough energy to fill creep.carry, and not taken
            const backupStructures = MemoryApi.getBackupStructuresJobs(
                room,
                (job: GetEnergyJob) =>
                    !job.isTaken && job.resources.energy >= creep.carryCapacity &&
                    job.targetType === STRUCTURE_TERMINAL
            );

            if (backupStructures.length > 0) {
                const terminal: StructureTerminal = Game.getObjectById(backupStructures[0].targetID) as StructureTerminal;
                if (creep.pos.isNearTo(terminal)) {
                    return backupStructures[0];
                }
            }
        }

        // Check for energy in the storage
        // Second check it to make sure we don't get out energy just to put it back in
        if (creepOptions.getFromStorage && this.isNonStorageJob(creep, room)) {
            // All backupStructures with enough energy to fill creep.carry, and not taken
            const backupStructures = MemoryApi.getBackupStructuresJobs(
                room,
                (job: GetEnergyJob) =>
                    !job.isTaken && job.resources.energy >= creep.carryCapacity &&
                    job.targetType === STRUCTURE_STORAGE
            );

            if (backupStructures.length > 0) {
                const storage: StructureStorage = Game.getObjectById(backupStructures[0].targetID) as StructureStorage;
                if (creep.pos.isNearTo(storage)) {
                    return backupStructures[0];
                }
            }
        }

        return undefined;
    }

    /**
     * Get a carry part job for the manager
     * @param creep the manager creep we are running
     * @param room the room the creep is in
     */
    private getCarryJob(creep: Creep, room: Room): CarryPartJob | undefined {
        const creepOptions: CreepOptionsCiv = creep.memory.options as CreepOptionsCiv;
        if (creepOptions.fillSpawn) {

        }

        if (creepOptions.fillTower) {

        }

        if (creepOptions.fillLink) {

        }

        if (creepOptions.fillStorage) {

        }
    }

    /**
     * Handle initalizing a new job
     * @param creep the creep we are using
     * @param room the room we are in
     */
    public handleNewJob(creep: Creep, room: Room): void {
        // Handle new job here
        // TODO
    }
}

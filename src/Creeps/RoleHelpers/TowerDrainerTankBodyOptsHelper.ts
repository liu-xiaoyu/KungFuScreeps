import {
    GROUPED,
    ROOM_STATE_INTRO,
    ROOM_STATE_BEGINNER,
    ROOM_STATE_INTER,
    ROOM_STATE_ADVANCED,
    ROOM_STATE_NUKE_INBOUND,
    ROOM_STATE_STIMULATE,
    ROOM_STATE_UPGRADER,
    TIER_1,
    TIER_2,
    TIER_3,
    TIER_4,
    TIER_5,
    TIER_6,
    TIER_7,
    TIER_8,
    ROLE_TOWER_TANK,
    ERROR_ERROR
} from "Utils/Imports/constants";
import { SpawnHelper, UserException, SpawnApi, MemoryApi_Room } from "Utils/Imports/internals";

export class TowerDrainerTankBodyOptsHelper implements ICreepBodyOptsHelper {

    public name: RoleConstant = ROLE_TOWER_TANK;

    constructor() {
        const self = this;
        self.generateCreepBody = self.generateCreepBody.bind(self);
        self.generateCreepOptions = self.generateCreepOptions.bind(this);
    }

    /**
     * Generate body for zealot creep
     * @param tier the tier of the room
     */
    public generateCreepBody(tier: TierConstant, room: Room): BodyPartConstant[] {
        // Default Values for Zealot
        let body: CreepBodyDescriptor = { work: 0, move: 0 };
        const opts: CreepBodyOptions = { mixType: GROUPED };

        switch (tier) {

            case TIER_8:
            case TIER_7:
            case TIER_6:
            case TIER_5:
            case TIER_4: // Total Cost: 1300
                body = { tough: 30, move: 20 };
                break;
        }

        // ! Important DONT FORGET TO CHANGE
        // Temp override
        // body = { attack: 1, move: 1 };
        // Generate creep body based on body array and options
        return SpawnApi.createCreepBody(body, opts);
    }

    /**
     * Generate options for zealot creep
     * @param roomState the room state of the room
     * @param squadSizeParam the size of the squad associated with the zealot
     * @param squadUUIDParam the squad id that the zealot is a member of
     * @param rallyLocationParam the meeting place for the squad
     */
    public generateCreepOptions(
        roomState: RoomStateConstant,
        squadUUIDParam: number | null,
        operationUUIDParam: number | null,
    ): CreepOptionsMili | undefined {
        let creepOptions: CreepOptionsMili = SpawnHelper.getDefaultCreepOptionsMili();
        creepOptions = {
            squadUUID: squadUUIDParam,
            operationUUID: operationUUIDParam,
        };

        return creepOptions;
    }

    /**
     * get the target room for the tower drainer tank
     * @param room the room we are spawning in
     * @param roleConst the role of the creep spawning
     * @param creepBody the body of the creep
     * @param creepName the name of the creep spawning
     */
    public getTargetRoom(room: Room, roleConst: RoleConstant, creepBody: BodyPartConstant[], creepName: string): string {
        // TODO impelmeent

        // Throw exception if we couldn't find a definite room memory
        throw new UserException(
            "Couldn't get target room for [" + roleConst + " ]",
            "room: [ " + room.name + " ]",
            ERROR_ERROR
        );
    }

    /**
     * get the home room for the tower drainer tank
     * @param room the room the creep is spawning in
     */
    public getHomeRoom(room: Room): string {
        return room.name;
    }

    /**
     * get the direction of the spawn the drainer should use
     * @param centerSpawn the center spawn of the bunker
     * @param room the room we are spawning in
     */
    public getSpawnDirection(centerSpawn: StructureSpawn, room: Room): DirectionConstant[] {
        const roomCenter: RoomPosition = MemoryApi_Room.getBunkerCenter(room, false);
        const directions: DirectionConstant[] = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
        const managerDirection: DirectionConstant = centerSpawn.pos.getDirectionTo(roomCenter!.x, roomCenter!.y);
        directions.splice(directions.indexOf(managerDirection), 1);
        return directions;
    }
}

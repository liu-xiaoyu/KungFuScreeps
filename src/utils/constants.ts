// Room State Constants
export const ROOM_STATE_INTRO = 0;
export const ROOM_STATE_BEGINNER = 1;
export const ROOM_STATE_INTER = 2;
export const ROOM_STATE_ADVANCED = 3;
export const ROOM_STATE_UPGRADER = 4;
export const ROOM_STATE_STIMULATE = 6;
export const ROOM_STATE_NUKE_INBOUND = 7;

// Role Constants
export const ROLE_MINER = "miner";
export const ROLE_HARVESTER = "harvester";
export const ROLE_WORKER = "worker";
export const ROLE_POWER_UPGRADER = "powerUpgrader";
export const ROLE_LORRY = "lorry";
export const ROLE_MINERAL_MINER = "mineralMiner";
export const ROLE_REMOTE_MINER = "remoteMiner";
export const ROLE_REMOTE_HARVESTER = "remoteHarvester";
export const ROLE_REMOTE_RESERVER = "remoteReserver";
export const ROLE_REMOTE_DEFENDER = "remoteDefender";
export const ROLE_CLAIMER = "claimer";
export const ROLE_COLONIZER = "remoteColonizer";
export const ROLE_ZEALOT = "zealot";
export const ROLE_STALKER = "stalker";
export const ROLE_MEDIC = "medic";
export const ROLE_DOMESTIC_DEFENDER = "domesticDefender";
export const ROLE_SCOUT = "scout";
export const ROLE_MANAGER = "manager";

// Tier Constants
export const TIER_1 = 300;
export const TIER_2 = 550;
export const TIER_3 = 800;
export const TIER_4 = 1300;
export const TIER_5 = 1800;
export const TIER_6 = 2300;
export const TIER_7 = 5300;
export const TIER_8 = 12300;

// Attack Flag Constants
export const ZEALOT_SOLO = 1;
export const STALKER_SOLO = 2;
export const STANDARD_SQUAD = 3;
export const CLAIM_FLAG = 4;
export const REMOTE_FLAG = 5;
export const OVERRIDE_D_ROOM_FLAG = 6;
export const STIMULATE_FLAG = 7;

// Creep Body Layout Constants
export const GROUPED = "grouped";
export const COLLATED = "collated";

// Role Priority List
// * Keep this list ordered by spawn priority
export const domesticRolePriority: RoleConstant[] = [
    ROLE_MINER,
    ROLE_HARVESTER,
    ROLE_MANAGER,
    ROLE_WORKER,
    ROLE_POWER_UPGRADER,
    ROLE_LORRY,
    ROLE_MINERAL_MINER,
    ROLE_SCOUT
];

// * Keep this list ordered by spawn priority
export const remoteRolePriority: RoleConstant[] = [
    ROLE_REMOTE_DEFENDER,
    ROLE_REMOTE_RESERVER,
    ROLE_REMOTE_MINER,
    ROLE_REMOTE_HARVESTER,
    ROLE_COLONIZER
];

// List of every structure in the game
export const ALL_STRUCTURE_TYPES: StructureConstant[] = [
    STRUCTURE_EXTENSION,
    STRUCTURE_RAMPART,
    STRUCTURE_ROAD,
    STRUCTURE_SPAWN,
    STRUCTURE_LINK,
    STRUCTURE_WALL,
    STRUCTURE_STORAGE,
    STRUCTURE_TOWER,
    STRUCTURE_OBSERVER,
    STRUCTURE_POWER_SPAWN,
    STRUCTURE_EXTRACTOR,
    STRUCTURE_LAB,
    STRUCTURE_TERMINAL,
    STRUCTURE_CONTAINER,
    STRUCTURE_NUKER,
    STRUCTURE_KEEPER_LAIR,
    STRUCTURE_CONTROLLER,
    STRUCTURE_POWER_BANK,
    STRUCTURE_PORTAL
];

// The Wall/Rampart HP Limit for each Controller level
export const WALL_LIMIT: number[] = [
    0, // RCL 0
    12500, // RCL 1
    25000, // RCL 2
    50000, // RCL 3
    125000, // RCL 4
    250000, // RCL 5
    500000, // RCL 6
    1000000, // RCL 7
    5000000 // RCL 8
];

// Cache Tick Limits
export const STRUCT_CACHE_TTL = 50; // Structures
export const SOURCE_CACHE_TTL = -1; // Sources
export const MINERAL_CACHE_TTL = -1; // Minerals
export const CONSTR_CACHE_TTL = 50; // Construction Sites
export const TOMBSTONE_CACHE_TTL = 50; // Tombstones
export const DROPS_CACHE_TTL = 50; // Dropped Resources
export const FCREEP_CACHE_TTL = 20; // Friendly Creep
export const HCREEP_CACHE_TTL = 1; // Hostile Creep
// GetEnergyJob Constants
export const SOURCE_JOB_CACHE_TTL = 50; // Source jobs
export const CONTAINER_JOB_CACHE_TTL = 5; // Container jobs
export const LINK_JOB_CACHE_TTL = 50; // Link Jobs
export const BACKUP_JOB_CACHE_TTL = 5; // Backup Jobs
export const PICKUP_JOB_CACHE_TTL = 50; // Pickup Jobs
// ClaimPartJob Constants
export const CLAIM_JOB_CACHE_TTL = 1; // Claim Jobs
export const RESERVE_JOB_CACHE_TTL = 1; // Reserve Jobs
export const SIGN_JOB_CACHE_TTL = 50; // Sign Jobs
export const ATTACK_JOB_CACHE_TTL = 1; // Attack Jobs
// WorkPartJob Constants
export const REPAIR_JOB_CACHE_TTL = 10; // Repair jobs
export const BUILD_JOB_CACHE_TTL = 10; // Build Jobs
export const UPGRADE_JOB_CACHE_TTL = -1; // Upgrade Jobs
// CarryPartJob Constants
export const FILL_JOB_CACHE_TTL = 10; // Fill Jobs
export const STORE_JOB_CACHE_TTL = 50; // Store Jobs

// ? Should we change DEPNDT to be 3 seperate consts? Attack, Remote, Claim?
export const DEPNDT_CACHE_TTL = 50; // Dependent Rooms - Attack, Remote, Claim

// Error Severity Constants
export const ERROR_FATAL = 3; // Very severe error - Game ruining
export const ERROR_ERROR = 2; // Regular error - Creep/Room ruining
export const ERROR_WARN = 1; // Small error - Something went wrong, but doesn't ruin anything
export const ERROR_INFO = 0; // Non-error - Used to log when something happens (e.g. memory is updated)

// Color Constants
export const COLORS: any = {};
COLORS[ERROR_FATAL] = "#FF0000";
COLORS[ERROR_ERROR] = "#E300FF";
COLORS[ERROR_WARN] = "#F0FF00";
COLORS[ERROR_INFO] = "#0045FF";

// Movement API Data Types
export const ROOM_STATUS_ALLY = "ally";
export const ROOM_STATUS_ALLY_REMOTE = "allyRemote";
export const ROOM_STATUS_NEUTRAL = "neutral";
export const ROOM_STATUS_HIGHWAY = "highway";
export const ROOM_STATUS_SOURCE_KEEPER = "sourceKeeper";
export const ROOM_STATUS_HOSTILE = "hostile";
export const ROOM_STATUS_HOSTILE_REMOTE = "hostileRemote";
export const ROOM_STATUS_UNKNOWN = "unknown";

// Custom Event Type Constants
export const C_EVENT_CREEP_SPAWNED = 1;

// All civilian roles we have
export const ALL_CIVILIAN_ROLES: RoleConstant[] = [
    ROLE_CLAIMER,
    ROLE_COLONIZER,
    ROLE_HARVESTER,
    ROLE_LORRY,
    ROLE_MANAGER,
    ROLE_MINER,
    ROLE_MINERAL_MINER,
    ROLE_POWER_UPGRADER,
    ROLE_REMOTE_HARVESTER,
    ROLE_REMOTE_MINER,
    ROLE_REMOTE_RESERVER,
    ROLE_SCOUT,
    ROLE_WORKER
];

// All Remote roles we have
export const ALL_REMOTE_ROLES: RoleConstant[] = [
    ROLE_REMOTE_HARVESTER,
    ROLE_REMOTE_MINER,
    ROLE_REMOTE_RESERVER
];

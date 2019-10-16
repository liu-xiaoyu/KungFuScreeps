Simple general info for the empire and running the code:

#-------- Flag Types ---------

<b>Remote Flag:</b>

    Yellow + any

<b>Claim Flag:</b>

    White + any

<b>Attack Flags:</b>

    Red + Red = Standard Squad
        (1 zealot, 1 medic, 1 stalker)

    Red + Blue = Zealot Solo
        (1 zealot)

    Red + Brown = Stalker Solo
        (1 stalker)

<b>Option Flags:</b>
    Green + White = Override Depedent Room
        (place this in the room you want to be the host room, applies to next dependent room flag)

    Green + Yellow = Stimulate Flag
        (place this in the room you want to be stimulated, must have a terminal)


#-------- Known Bugs --------

- We always seem to need priority harvester, even when we shouldn't, needs refactoring

#-------- Horizon -----------
- Claiming
- Expand military intelligence
- Market
- Inter-room assistance
- Possibly assimilation-like feature where our code - bases act as 1?
- Robust Ally code to help each other

#-------- Console Commands --------

  // removes constructions sites in a room, can specify which type
- removeConstructionSites(roomName: string, structureType?: string): void;

  // Removes flags by name
- removeFlags(substr: string): void;

  // Display room status, can specify which room
- displayRoomStatus(roomName: string): void;

  // Kills all creeps, can specify which room
- killAllCreeps(room?: Room): void;

  // Send amount of type of resource from one room to the target room
- sendResource(sendingRoom: Room, receivingRoom: Room, resourceType: ResourceConstant, amount: number): void;


#----- Military Instructions ------

- Zealot Solo:
    - Red + Blue

- Standard Squad:
    - Red + Red

- Stalker Solo:
    - Red + Brown

<br>

- Only one flag can be active in a room at time to count towards spawning for the attack room
You can change flags from being 1 time use in the military config, but by default once a flag's
spawning has been satisfied, it is removed

- Send 5 people in a row, one after enough, a set number of times:
    set flag to one time use in config, place 5 flags of the same type down


#---- Military Roles --------------------
- Zealot:
  - Standard powerful melee creep, no kiting capability, but pure damage

- Stalker:
  - Standard powerful ranged creep, will kite enemies, but not as much damage as a zealot

 - Medic:
    - Standard Healing type creep, non-combat, pure healing, generally moves with squad, will heal in the following order
      - squad -> friendly creeps -> ally creeps

- Domestic Defender:
  - Ranged attacker. Only spawned to defend the home room from attack.
  - travels to closest rampart to the defender and defends from there

- Remote Defender:
  - Ranged Attacker. Only spawned to defend a remote room from attack.

---- How To ----------------------------
- Attack a Room --- :
  - Place a Red + {secondaryColor} flag in the room you wish to attack.
  - Place a rally flag where you wish for squads to rally, if no rally flag is present, squad will rally in the room before the attack room

- Claim a Room ---- :
  - Place a White + {secondaryColor} flag in the room you wish to claim

- Set a Remote Room --- :
  - Place a Yellow + {secondaryColor} flag in the room you wish to set as your remote room

- Override Automatic Dependent Room (Attack, Remote, Claim) Placement --- :
  - Place an Override Option Flag in the Owned room you wish to set as the host room
  - Place a remote, attack, or claim flag at your desired location
  - Note:
    - Only one dependent override room may be active at a time
    - The override flag will be removed after the host room is assigned a dependent room

General Suggested Room Flow ------------ (Subject to change, update as new optimizations are found)

Each RCL ---:
  Build all extensions and roads leading/through them every chance you get
  Build towers every chance you get
  Build Spawn every chance you get

- RCL 1 ---:
  - No action needed

- RCL 2 ---:
  - Build roads to sources and controller

- RCL 3 ---:
  - Build containers at the sources
  - Build walls and ramparts

- RCL 4 ---:
  - Build Extensions, roads through the extensions, and a storage
  - Upon storage completion, claim a remote room

- RCL 5 ---:
  - No additional actions needed

- RCL 6 ---:
  - Build links, terminal, and labs
  - Upon links' completion, power upgrader comes out

- RCL 7 ---:
  - Expand to multiple remote rooms as the second spawn can now support them

- RCL 8 ---:
  - No additional actions needed


#Code Instructions: ---------------------

#---- Adding a new Military Role --------
- Add the creep role constant to type list of roles, type the constant, and add the constant (just add to enum when we have that online)
- Add to mili config the name of the creep role to add to the proper tier it's spawning is considered for, and ALL_MILI_ROLES
  Create and complete a role manager
- Add the call to the role manager to run creep role switch statement
- Add creep body definition
- Add creep options definition
- Add creep military options
- Add getTargetRoom definition
  Create the flag to trigger spawning for the role
- Add the handling for the new role in militaryQueue spawn
- Add reference to empire guide for the flag definition/role spawned
- Add the role to be handled in EventHelper -> getRequestingFlag
- Add the creep role to generateDefaultAllCreepCountObject

#---- Adding a new Domestic Role --------
- Add the creep role constant to type list of roles, type the constant, and add the constant (just add to enum when we have that online)
- Create and complete a role manager
- Add the call to the role manager to run creep role switch statement
- Add creep body definition
- Add creep options definition
- Add getTargetRoom definition
- Add the new role to creep limits in types and in the spawn api/helper functions
- Add definitions for when this creep should spawn
- Add the creep role to generateDefaultAllCreepCountObject

#---- Adding a new Remote Role ----------
  - Add the creep role constant to type list of roles, - type the constant, and add the constant (just add to - enum when we have that online)
  - Create and complete a role manager
  - Add the call to the role manager to run creep role - switch statement
  - Add creep body definition
  - Add creep options definition
  - Add getTargetRoom definition
  - Add the new role to creep limits in types and in the - spawn api/helper functions
  - Add definitions for when this creep should spawn
  - Add the creep role to - generateDefaultAllCreepCountObject

#---- Adding a new Flag -----------------
- Create the flag type constant
- Put the flag call to be processed in its proper place if - its a form of an existing flag, put it in a new color catagory if its a completely new flag type
- Add function in api/helper to process the new flag type
- you must create a new file for the flag type to be - handled in
- Add reference to empire guide
- If the new flag is a military flag, go to mili config - and add the reference to it (this is used for squad - spawning)

#---- Kung Fu Pattern Tutorial -----------
AKA Strategy Pattern
The implementation here is simple and extremely useful for replacing code smells.
The biggest one that this fixes is large switch statements that decide what function to call (ie flag handling, role handling, creep opts/body/memory)
  - Create an interface for the general thing you want to implement (ICreepRoleManager)
  - Create one file per implementation (ie one file per creep role)
  - Implement the interface here and include the functions you're abstracting into the interface
  - Customize this in each file for its specific use case (the manager implementation for each role)
  - Include in the interface a definition for a name or id, some way to define which file is which from the outside
  - Go to interface constants and import your files here and create an array instansiating these objects in them,
    - make the type the interface that they all implement so you can call the functions directly off this array
  - Go to where you want to decide which of these files to run the function from (where you would place the big switch statement ie)
  - Create a for loop that goes over the array you just made and compares its name/id/constant value identifier to the identifier in your function
    - that lets you decide which to call (ie the creep role constant to decide which role to run)
  - When you hit the correct instance of the class function you're wanting, you can simply call arrayName[identifier].functionName and you're done!


#`------- Common terminal commands ---------
Compile and upload code to screeps:

    rollup -c --environment DEST:main       // compile and upload once
    rollup -cw --environment DEST:main      // watch the code to compile and reupload on save

Git Command Line Cheat Sheet:

    git status
        shows information about your current state in git (branch, commits, files staged, etc)

    git add {filepath}
        stage a single file
    git add -u
        stage all unstaged files that you previous staged
    git add .
        stage all unstaged files

    git commit -m "commit message here"
        commit with a message
    git commit
        commit and opens up vi in terminal with info about your commit, write message and do :wq to save commit

    git push
        i mean yeah... lol...
        make the remote tracking branch attached to your local branch match your local copy
    git push -f
        force replace the origin branch with your local branch (useful after a rebase since you rewrote history technically)

    git rebase {branch name}
        rebase a branch into your current HEAD (puts all your commits after the last commit on the branch you're bringing in)
    git rebase -i {branch name}
        rebase a branch into your current HEAD, interactive mode, use this to squash/edit/exlucde commits
    git pull
        git fetch and git merge mixed into one command

    git checkout {branch name}
        checkout a new branch off your current local HEAD
    git checkout {old branch name} -b {new branch name}
        checkout a new branch off the old branch (ie git checkout origin/master -b coolnewfeature)
    git branch
        show all local branches with a * by the one your HEAD is pointing to

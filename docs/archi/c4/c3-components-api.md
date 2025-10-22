flowchart LR
subgraph api [NestJS API]
cAuth[AuthController]
cUsers[UsersController]
cHabits[HabitsController]
cMed[MedicationsController]
cRes[ResourcesController]

    sAuth[AuthService]
    sUsers[UsersService]
    sHabits[HabitsService]
    sMed[MedicationsService]
    sRes[ResourcesService]

    rUsers[(UsersRepository)]
    rHabits[(HabitsRepository)]
    rRes[(ResourcesRepository)]

    provJwt[JwtProvider]
    provMail[Mailer]
    validator[Validation Pipe]
end

cAuth --> sAuth --> rUsers
cUsers --> sUsers --> rUsers
cHabits --> sHabits --> rHabits
cMed --> sMed
cRes --> sRes --> rRes

sAuth --> provJwt
sAuth --> provMail

cAuth -.-> validator
cUsers -.-> validator
cHabits -.-> validator
cRes -.-> validator

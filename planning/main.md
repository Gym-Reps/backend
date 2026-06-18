# Reps Backend Planning

## Functional Requisites

[] User must be able to register
[] User must be able to authenticate
[] User must be able to update password
[] User must be able to create trainment template
[] User must be able to add exercise template to trainment template
[] User must be able to register new trainment using trainment templates
[] User must be able to see diff metrics between the last 2 trainments of the same nature(e.g. Upper A, Lower B)
[] User must be able to get its progress in comparison with trainments and exercises
[] User must be able to export progress and metrics to social media(Instagram)

## Non-Funcitonal Requisites

[] User password must be hashed
[] User must be able to see progress on charts, separated by trainment exercises and time, considering the weight and reps count
[] Each trainment is coumpound of exercises and exercises are compound of sets that are coumpond of `{ weight: number; reps: number }`
[] Trainment template and exercise template differ from Trainment and exercise in a way that the templates contains reps ranges, linked to trainment template, and the trainment itself is a new record everytime a user goes to the gym and perform a new workout

```E.G.
    Trainment Template: Upper A, Upper B, Lower A
    Exercise Template: Squat/3 sets/8-12reps

    Trainment: Upper A at June 17th
    Exercise: Squat { 1: { weight: 80 /* in kg */, reps: 12}, 2: { weight: 80 /* in kg */, reps: 12}, 3: { weight: 80 /* in kg */, reps: 12} }
```

[] Decide if `sets` is gonna be a new entity or a `JSONB` column on `exercise` records

## Business Rules

[] Trainments must be only created from trainment templates
[] Sets must be able to contain different reps range for a same exercise

## Entities

`trainment_template`
`exercise_template`
`set?`
`trainment`
`exercise`
`user`
`metrics`

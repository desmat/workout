import { Exercise } from '@/types/Exercise';
import { Workout } from '@/types/Workout';

export const sampleExercises: Exercise[] = [
  {"id":"c1977455-36e8-4dc8-86c1-76f65e730fc2","createdBy":"eDcD0gwTvFeJJQNlqHQv9vFV45i1","createdAt":1702585437126,"status":"created","name":"Push ups"},{"id":"0eea0e09-de1c-41db-b8e1-863be341658e","createdBy":"eDcD0gwTvFeJJQNlqHQv9vFV45i1","createdAt":1702585437126,"status":"created","name":"Pull ups"},{"id":"ba3883f5-e7fd-4b47-ac64-c3cd18f89420","createdBy":"eDcD0gwTvFeJJQNlqHQv9vFV45i1","createdAt":1702585437126,"status":"created","name":"sit ups"},{"id":"fbb4487e-0e83-4eac-adf7-1c48d345c36d","createdBy":"eDcD0gwTvFeJJQNlqHQv9vFV45i1","createdAt":1702585443822,"status":"created","name":"Foo"},{"id":"b1cac47f-8a00-4337-8b44-6ed3e6f7c38a","createdBy":"eDcD0gwTvFeJJQNlqHQv9vFV45i1","createdAt":1702585443823,"status":"created","name":"bar"}
];

export const sampleWorkouts: Workout[] = [
  {"id":"0adba0e4-d5cd-4f29-bb62-1cceb10929bd","createdBy":"eDcD0gwTvFeJJQNlqHQv9vFV45i1","createdAt":1702585437125,"status":"created","name":"Test 1","exercises":[{"id":"c1977455-36e8-4dc8-86c1-76f65e730fc2","name":"Push ups"},{"id":"0eea0e09-de1c-41db-b8e1-863be341658e","name":"Pull ups"},{"id":"ba3883f5-e7fd-4b47-ac64-c3cd18f89420","name":"sit ups"}]},{"id":"6f929c3e-b22e-48a2-9131-3f8af90470b0","createdBy":"eDcD0gwTvFeJJQNlqHQv9vFV45i1","createdAt":1702585443820,"status":"created","name":"Test 2","exercises":[{"id":"fbb4487e-0e83-4eac-adf7-1c48d345c36d","name":"Foo"},{"id":"b1cac47f-8a00-4337-8b44-6ed3e6f7c38a","name":"bar"}]}
];

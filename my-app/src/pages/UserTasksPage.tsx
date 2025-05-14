import React from 'react';
import { UserTasks } from '../components/UserTasks';

export function UserTasksPage({
  token,
  userId,
}: {
  token: string;
  userId: string;
}) {
  return <UserTasks token={token} userId={userId} />;
}

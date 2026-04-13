import { useState, useEffect, useCallback } from 'react';
import { teamService, IUser, IRole } from '../services/team.service';

export function useTeam() {
  const [users, setUsers] = useState<(IUser & { id: string })[]>([]);
  const [roles, setRoles] = useState<(IRole & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, rolesData] = await Promise.all([
        teamService.getUsers(),
        teamService.getRoles()
      ]);
      setUsers(usersData.map((u: any) => ({ ...u, id: u._id })));
      setRoles(rolesData.map((r: any) => ({ ...r, id: r._id })));
    } catch (err: any) {
      console.error('Failed to fetch team data:', err);
      setError(err.message || 'Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createUser = async (data: any) => {
    try {
      const newUser = await teamService.createUser(data);
      await fetchData();
      return newUser;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create user');
    }
  };

  const updateUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await teamService.updateUserStatus(userId, newStatus);
      await fetchData();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update user status');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await teamService.deleteUser(userId);
      await fetchData();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete user');
    }
  };

  const createRole = async (data: any) => {
    try {
      const newRole = await teamService.createRole(data);
      await fetchData();
      return newRole;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create role');
    }
  };

  const updateRole = async (roleId: string, data: any) => {
    try {
      const updatedRole = await teamService.updateRole(roleId, data);
      await fetchData();
      return updatedRole;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update role');
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      await teamService.deleteRole(roleId);
      await fetchData();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete role');
    }
  };

  const updateUserRole = async (userId: string, orgRole: string) => {
    try {
      await teamService.updateUserRole(userId, orgRole);
      await fetchData();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update user role');
    }
  };

  return {
    users,
    roles,
    isLoading,
    error,
    refresh: fetchData,
    createUser,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    createRole,
    updateRole,
    deleteRole
  };
}

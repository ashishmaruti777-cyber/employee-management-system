import { useSelector } from 'react-redux';

export const usePermission = () => {
  const { user } = useSelector((state) => state.auth);

  const hasPermission = (module, action = 'read') => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (!user.rolePermissions) return false;
    const modulePerm = user.rolePermissions.find((p) => p.module === module);
    return modulePerm && modulePerm.actions.includes(action);
  };

  const hasAnyPermission = (permissions) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (!user.rolePermissions) return false;
    return permissions.some(({ module, action }) => hasPermission(module, action));
  };

  const isRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return { hasPermission, hasAnyPermission, isRole };
};

export default usePermission;

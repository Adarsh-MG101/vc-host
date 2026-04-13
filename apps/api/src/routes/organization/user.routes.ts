import { Router } from 'express';
import * as userController from '../../controllers/organization/user.controller';

const router = Router();

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.put('/:userId/role', userController.updateUserRole);
router.put('/:userId/status', userController.updateUserStatus);
router.delete('/:userId', userController.deleteUser);

export default router;

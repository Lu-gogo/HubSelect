const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/', projectController.getProjects);
router.post('/scan', projectController.scanUserRepos);
router.delete('/clear', projectController.clearProjects);

module.exports = router;
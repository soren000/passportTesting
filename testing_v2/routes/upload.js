var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.send('router divider worked');
})

module.exports = router;

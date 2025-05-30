<?php
// this is a simple script to generate a hashed password
echo password_hash('123456', PASSWORD_BCRYPT);
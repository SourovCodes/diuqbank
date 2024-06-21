<?php

namespace App\Enums;

enum UserRole: string
{

    const user = 'User';
    const admin = 'Admin';


    public static function toArray()
    {
        return [
            self::user,
            self::admin,

        ];
    }



}
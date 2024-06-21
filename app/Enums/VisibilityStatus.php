<?php

namespace App\Enums;

enum VisibilityStatus: string
{

    const private = 'Private';
    const public = 'Public';
    const draft = 'Draft';


    public static function toArray()
    {
        return [
            self::private ,
            self::public ,
            self::draft,

        ];
    }



}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PageController extends Controller
{
    public function faq()
    {
        return view('pages.faq');
    }
    public function cfDiv2()
    {
        return view('pages.cf-div-2');
    }
    public function about()
    {
        return view('pages.about');
    }
    public function contact()
    {
        return view('pages.contact');
    }
    public function privacyPolicy()
    {
        return view('pages.privacy-policy');
    }
    public function termsAndConditions()
    {
        return view('pages.terms-and-conditions');
    }
}

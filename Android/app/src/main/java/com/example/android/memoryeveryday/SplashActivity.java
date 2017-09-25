package com.example.android.memoryeveryday;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.support.v7.app.AppCompatActivity;

/**
 * Created by KimDongGyu on 2017-09-25.
 */

public class SplashActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.splash);
        Handler hd = new Handler();
        hd.postDelayed(new splashhandler(), 3000);
    }

    private class splashhandler implements Runnable{
        public void run() {
            startActivity(new Intent(getApplication(), MainActivity.class));
            SplashActivity.this.finish();
        }
    }
}

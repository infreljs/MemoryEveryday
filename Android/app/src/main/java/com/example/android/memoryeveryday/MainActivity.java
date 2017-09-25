package com.example.android.memoryeveryday;

import android.app.Activity;
import android.app.ProgressDialog;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.Window;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;

public class MainActivity extends AppCompatActivity {

    private WebView mainWebView;
    private ProgressBar progressBar;
    final Activity activity = this;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().requestFeature(Window.FEATURE_PROGRESS);
        setContentView(R.layout.activity_main);

        progressBar = (ProgressBar) findViewById(R.id.progressBar1);

        mainWebView = (WebView) findViewById(R.id.main_web_view);
        mainWebView.getSettings().setJavaScriptEnabled(true);
        mainWebView.loadUrl("http:\\m.naver.com");
        mainWebView.setWebViewClient(new FarmWebViewClient());

        mainWebView.setWebChromeClient(new WebChromeClient()
        {
            public void onProgressChanged(WebView view, int progress)
            {
                if (progress<100)
                {
                    progressBar.setVisibility(ProgressBar.VISIBLE);
                }
                else if (progress==100)
                {
                    progressBar.setVisibility(ProgressBar.GONE);
                }
                progressBar.setProgress(progress);
            }
        });
    }
    private class FarmWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            view.loadUrl(url);
            return true;
        }
    }
}

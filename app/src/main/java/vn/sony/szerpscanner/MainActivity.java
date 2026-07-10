package vn.sony.szerpscanner;

import android.app.AlertDialog;
import android.content.Context;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebStorage;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public class MainActivity extends AppCompatActivity {

    // Chỉnh 3 IP máy chủ SZERP tại đây nếu công ty đổi địa chỉ
    private static final String[] SERVER_IPS = {
            "10.10.115.167",
            "10.10.115.162",
            "10.10.115.152"
    };

    private WebView webView;
    private Spinner spinnerServer;
    private String injectJs;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        injectJs = loadInjectScript();

        // Luôn bắt đầu phiên sạch: xoá hết cookie/session của người dùng trước đó
        clearAllSession();

        spinnerServer = findViewById(R.id.spinnerServer);
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_dropdown_item, SERVER_IPS);
        spinnerServer.setAdapter(adapter);

        webView = findViewById(R.id.webview);
        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setLoadWithOverviewMode(true);
        ws.setUseWideViewPort(true);
        ws.setSupportZoom(true);
        ws.setBuiltInZoomControls(true);
        ws.setDisplayZoomControls(false);
        // SZERP là hệ thống cũ, server có kiểm tra User-Agent và chỉ nhận
        // trình duyệt kiểu Chrome 36-39 (như PC công ty đang dùng). WebView
        // mặc định gửi User-Agent hiện đại nên bị server từ chối, trả về
        // trang lỗi "系统异常". Giả User-Agent cũ để server nhận diện đúng.
        ws.setUserAgentString(
                "Mozilla/5.0 (Linux; Android 4.4.2; SM-HONEYWELL) "
                        + "AppleWebKit/537.36 (KHTML, like Gecko) "
                        + "Chrome/36.0.1985.135 Mobile Safari/537.36");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (injectJs != null) {
                    view.evaluateJavascript(injectJs, null);
                }
            }
        });

        Button btnLoad = findViewById(R.id.btnLoad);
        btnLoad.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                loadLoginPage();
            }
        });

        Button btnToggleScan = findViewById(R.id.btnToggleScan);
        btnToggleScan.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                webView.evaluateJavascript(
                        "(window.szerpToggleScan ? window.szerpToggleScan() : 'chua_san_sang')",
                        null);
            }
        });

        Button btnExit = findViewById(R.id.btnExit);
        btnExit.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                confirmExit();
            }
        });
    }

    private void loadLoginPage() {
        int idx = spinnerServer.getSelectedItemPosition();
        String ip = SERVER_IPS[Math.max(idx, 0)];
        // Vào thẳng gốc szerp/, server sẽ tự chuyển đến trang đăng nhập
        // (KHÔNG dùng login.htm/login.shtml - đó chỉ là tên file lúc Save As,
        // không phải đường dẫn thật trên server).
        String url = "http://" + ip + ":8080/szerp/";
        webView.loadUrl(url);
    }

    private void confirmExit() {
        new AlertDialog.Builder(this)
                .setTitle("Thoát ứng dụng")
                .setMessage("Đăng xuất và xoá phiên làm việc hiện tại?")
                .setPositiveButton("Thoát", (dialog, which) -> {
                    clearAllSession();
                    webView.loadUrl("about:blank");
                    finish();
                })
                .setNegativeButton("Huỷ", null)
                .show();
    }

    private void clearAllSession() {
        CookieManager cm = CookieManager.getInstance();
        cm.removeAllCookies(null);
        cm.flush();
        WebStorage.getInstance().deleteAllData();
        if (webView != null) {
            webView.clearCache(true);
            webView.clearHistory();
            webView.clearFormData();
        }
    }

    private String loadInjectScript() {
        try {
            InputStream is = getAssets().open("inject.js");
            BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append('\n');
            }
            reader.close();
            return sb.toString();
        } catch (IOException e) {
            Toast.makeText(this, "Không đọc được inject.js: " + e.getMessage(), Toast.LENGTH_LONG).show();
            return null;
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        // Đảm bảo phiên đăng nhập của nhân viên không tồn tại sau khi tắt app,
        // tránh nhầm lẫn nhân viên xuất kho giữa các ca/người dùng.
        clearAllSession();
        super.onDestroy();
    }
}

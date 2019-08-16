package custom;

import android.util.Log;

import com.attendize.R;
import com.attendize.Splash;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class CommonModule extends ReactContextBaseJavaModule {

    public CommonModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "AndroidCommon";
    }

    @ReactMethod
    public void closeSplashScreen(){

        Log.d("cancel", "s" +
                "plash screen");
        Splash.activity.finish();
        Splash.activity.overridePendingTransition(R.anim.catalyst_fade_in, R.anim.catalyst_fade_out);
    }
}

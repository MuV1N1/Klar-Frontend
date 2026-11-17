package de.muv1n.klar;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(LiveTimerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

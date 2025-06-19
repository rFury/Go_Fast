package com.example.app;

import com.getcapacitor.BridgeActivity;
import com.google.firebase.FirebaseApp;

public class MainActivity extends BridgeActivity {
  @Override
  public void onStart() {
    super.onStart();
    FirebaseApp.initializeApp(this); // ✅ This initializes Firebase correctly
  }
}

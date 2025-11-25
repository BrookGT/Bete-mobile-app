import React, { createContext, useContext, useState, useCallback } from "react";
import { Text } from "react-native";
import { Snackbar } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ToastContext = createContext({ show: (_msg) => {} });

export function ToastProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  const show = useCallback((msg) => {
    setMessage(msg);
    setVisible(true);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={1600}
        style={{
          position: "absolute",
          top: (insets.top || 0) + 24,
          left: 16,
          right: 16,
          borderRadius: 999,
          backgroundColor: "#111827",
          zIndex: 2000,
          elevation: 4,
        }}
      >
        <Text style={{ color: "#fff" }}>{message}</Text>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

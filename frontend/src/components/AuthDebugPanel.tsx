"use client";
import { useAuth } from "@/context/AuthContext";
import { useTokenStatus } from "@/hooks/useTokenStatus";
import { getTokenUserInfo, getTokenMetadata } from "@/utils/tokenUtils";

export function AuthDebugPanel() {
  const {
    user,
    token,
    isLogin,
    isTokenValid,
    tokenExpiry,
    error,
    getTokenPayload,
  } = useAuth();

  const {
    isValid,
    isExpiringSoon,
    expiryTime,
    timeUntilExpiry,
    tokenPayload,
  } = useTokenStatus();

  const userInfo = getTokenUserInfo(token);
  const metadata = getTokenMetadata(token);

  return (
    <div className="fixed bottom-0 right-0 p-4 bg-slate-900 text-white text-xs max-w-sm max-h-96 overflow-y-auto rounded-tl-lg font-mono">
      <div className="space-y-2">
        <h3 className="font-bold text-sm border-b pb-2">Auth Debug Panel</h3>

        <div className="space-y-1">
          <p>
            <span className="text-blue-400">isLogin:</span> {isLogin ? "✅" : "❌"}
          </p>
          <p>
            <span className="text-blue-400">isTokenValid:</span>{" "}
            {isTokenValid ? "✅" : "❌"}
          </p>
          <p>
            <span className="text-blue-400">isExpiringSoon:</span>{" "}
            {isExpiringSoon ? "⚠️" : "✅"}
          </p>
        </div>

        {user && (
          <div className="border-t pt-2 space-y-1">
            <p className="text-green-400">User: {user.email}</p>
            <p className="text-green-400">Name: {user.name}</p>
            <p className="text-green-400">Role: {user.role}</p>
          </div>
        )}

        {metadata && (
          <div className="border-t pt-2 space-y-1">
            <p>
              <span className="text-yellow-400">Remaining:</span>{" "}
              {timeUntilExpiry}
            </p>
            <p>
              <span className="text-yellow-400">Expires:</span>{" "}
              {expiryTime ? new Date(expiryTime).toLocaleTimeString() : "N/A"}
            </p>
            <div className="w-full bg-gray-700 rounded h-1 mt-1">
              <div
                className="bg-green-500 h-1 rounded transition-all"
                style={{ width: `${100 - metadata.percentageUsed}%` }}
              ></div>
            </div>
          </div>
        )}

        {error && (
          <div className="border-t pt-2">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        {tokenPayload && (
          <div className="border-t pt-2 space-y-1 text-gray-300">
            <p className="text-gray-400">Payload:</p>
            <p>sub: {tokenPayload.sub}</p>
            <p>role: {tokenPayload.role}</p>
            <p>iat: {new Date(tokenPayload.iat * 1000).toLocaleTimeString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}

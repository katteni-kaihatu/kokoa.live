import {UserInfo} from "@/contexts/Application";

export class ApiClient {
    constructor(_endpoint?: string) {
        console.log("oOoOoOoOoO API SERVICE CREATED OoOoOoOoOo");
    }

    async getUserInfo() {
        try {
            const result = await fetch(`/api/user`, {
                credentials: "include",
            });
            if (result.status === 401) {
                return null;
            }
            return await result.json();
        } catch (e) {
            return null;
        }
    }

    async login(RLToken: string) {
        console.log("login with RLToken");
        try {
            const result = await fetch(`/api/auth`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${RLToken}`,
                },
            });
            const r = await result.json();
            console.log(r);
            return r;
        } catch (e) {
            return null;
        }
    }

    async logout() {
        try {
            const result = await fetch(`/api/auth`, {
                method: "DELETE",
                credentials: "include",
            });
            return result.status === 204;
        } catch (e) {
            return false;
        }
    }

    async updateUserInfo(
        userInfo: UserInfo,
    ) {
        try {
            const result = await fetch(`/api/user`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userInfo),
            });
            return result.status === 200;
        } catch (e) {
            return false;
        }
    }

    async getResoniteUserDataFromUserId(userId: string) {
        if (!userId.startsWith("U-")) return null;
        try {
            const result = await fetch(`/api/proxy/resonite/users/${userId}`);
            return await result.json();
        } catch (e) {
            return null;
        }
    }

    async getLiveStatus() {
        try {
            const result = await fetch(`/api/live/status`, {
                credentials: "include",
            });
            if (!result.ok) {
                return null;
            }
            return await result.json();
        } catch (e) {
            return null;
        }
    }

    async setLiveStatus({
        name,
        description,
        iconUrl,
    }: {
        name: string;
        description: string;
        iconUrl?: string;
    }) {
        try {
            const result = await fetch(`/api/live/status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ name, description, iconUrl }),
            });
            return await result.json();
        } catch (e) {
            return { success: false, message: "network error" };
        }
    }

    async deleteLiveStatus() {
        try {
            const result = await fetch(`/api/live/status`, {
                method: "DELETE",
                credentials: "include",
            });
            // 204 or 200
            return result.ok;
        } catch (e) {
            return false;
        }
    }
}

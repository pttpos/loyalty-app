// types.ts
export type RootStackParamList = {
    Login: undefined;
    UserHomeScreen: undefined;
    AdminHomeScreen: undefined;
    AdminBannerScreen: undefined;
    EmailVerification: { email: string; uid: string };
    HomePage: undefined;
    DetailBannerPage: { bannerId: string };
    Admin: undefined;
  };
  
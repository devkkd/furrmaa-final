@echo off
set SRC=%~dp0..\..\.integration-backup\src
set DST=%~dp0..\src
echo Copying integration from %SRC% to %DST%
xcopy /Y /I "%SRC%\screens\ecommerce\CheckoutScreen.tsx" "%DST%\screens\ecommerce\"
xcopy /Y /I "%SRC%\screens\ecommerce\ReturnOrderScreen.tsx" "%DST%\screens\ecommerce\"
xcopy /Y /I "%SRC%\screens\ecommerce\OrderDetailScreen.tsx" "%DST%\screens\ecommerce\"
xcopy /Y /I "%SRC%\screens\profile\SupportChatScreen.tsx" "%DST%\screens\profile\"
xcopy /Y /I "%SRC%\screens\profile\WalletScreen.tsx" "%DST%\screens\profile\"
xcopy /Y /I "%SRC%\screens\profile\WithdrawWalletScreen.tsx" "%DST%\screens\profile\"
xcopy /Y /I "%SRC%\screens\profile\RechargeWalletScreen.tsx" "%DST%\screens\profile\"
xcopy /Y /I "%SRC%\screens\profile\PetProfileScreen.tsx" "%DST%\screens\profile\"
xcopy /Y /I "%SRC%\screens\profile\ProfileScreen.tsx" "%DST%\screens\profile\"
xcopy /Y /I "%SRC%\screens\profile\SubscriptionScreen.tsx" "%DST%\screens\profile\"
xcopy /Y /I "%SRC%\screens\profile\OrdersScreen.tsx" "%DST%\screens\profile\"
xcopy /Y /I "%SRC%\screens\healthcare\PetHealthScreen.tsx" "%DST%\screens\healthcare\"
xcopy /Y /I "%SRC%\screens\explore\ExploreScreen.tsx" "%DST%\screens\explore\"
xcopy /Y /I "%SRC%\screens\hope\HopeDetailScreen.tsx" "%DST%\screens\hope\"
xcopy /Y /I "%SRC%\screens\training\SubscriptionScreen.tsx" "%DST%\screens\training\"
xcopy /Y /I "%SRC%\context\AuthContext.tsx" "%DST%\context\"
echo Done.
pause

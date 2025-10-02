# CHANGELOG

## [1.8.1] - 2025-10-02

### Added

- Challenges
  - ChallengesScreen

## Changed

- Clan
  - ExistingClan
- Containers
  - PossibleRewardsScreen
- Entrance
  - EntranceForms
- General
  - LoadingScreen
  - Modal
  - NotificatorIcon
- Lobby
  - ChatWindow
- Quests
  - QuestsScreen
- Settings
  - ThemeSettings
- Shop
  - PaymentScreen
  - PurchaseScreen
- Updated the theme website to look modern :tada:

## [1.8.0] - 2025-09-16

### Added

- General
  - RetriationBonus
- Settings
  - SettingsContent
  - ThemeSettings
- New completely custom `svg` theme icon
- Auto-build and release workflow enhancements :tada:
- `Coloris` library for color inputs inside the theme tab
- Variable extraction and injection functionality
- Resource caching and optimization system :tada:

### Changed

- Battle
  - BattleChat
  - BattlePause
- Clan
  - ClanModal
  - ExistingClan
- Containers
  - ContainersOpening
  - ContainersScreen
  - PossibleRewardsMenu
  - PossibleRewardsScreen
- Entrance
  - EntranceForms
- Friends
  - FriendsScreen
  - InviteScreen
- General
  - Dropdown
  - LoadingScreen
  - Modal
  - NotificatorIcon
  - PlayerContextMenu
  - TopMenu
  - TopPanel
  - XP
- Lobby
  - BattleSelect
    - BattleType
  - ChatWindow
  - FooterMenu
  - GroupBlock
  - MainMenu
- Quests
  - ContractsScreen
  - QuestsScreen
- Shop
  - MainScreen
  - PaymentScreen
  - PurchaseScreen
  - SectionMenu
  - ShopWindow
- Variables
- All CSS selectors updated to use single quotes
- `BreeziumSelect` library integration (using the downloaded modules) and styling updates
- Enhanced main userscript with detailed comments and theme handling
- Image optimization and .webp format support
- Improved file name extraction helper script
- Updated links to use 'builds' branch for CSS and JS resources

### Fixed

- Entrance
  - EntranceForms (input selectors)
- General
  - Modal (change creator tag apply button, disabled button styles)
- Theme loading and integration fixes
- Injector logic for theme functionality

## [1.7.2] - 2025-04-01

### Added

- General
  - CheckboxInput
- Lobby
  - GroupBlock
- Shop
  - PaymentScreen

### Changed

- Clan
  - ExistingClan
- Entrance
  - EntranceForms
- General
  - Modal
  - RangeInput
  - TopPanel
- Lobby
  - BattleSelect
    - BattleType
  - MainMenu
  - NewsWindow
- Quests
  - QuestsScreen
- Shop
  - MainScreen
  - PurchaseScreen
  - ShopWindow
- Now when the seasons change, the main userscript will only update the images.

### Fixed

- Entrance
  - EntranceForms (social media buttons)
- General
  - Modal (tooltips, captcha)

---

## [1.7.1] - 2025-03-06

### Added

- From now the script checks if the time of year has changed and, if it has, updates the resources

### Changed

- Clan
  - ExistingClan
- Lobby
  - NewsWindow

---

## [1.7.0] - 2025-02-26

### Added

- Containers
  - PossibleRewardsMenu
- General
  - CommonSort
  - RangeInput
- Shop
  - MainScreen
  - PurchaseScreen
  - SectionMenu
  - SuccessfulPurchase
- `JSON` with stable versions so that auto-updates only occur for stable versions :tada:
- `Logger` class designed for `userscript` logging; supports different logging modes :tada:
- Few new `SVGs`
- Loading screen while modules are loading with progress bar displayed; it also has translations into different languages :tada:
- Missing screenshots/gifs for README of modules
- Namespace for the main userscript
- New way of loading modules; now modules are loaded from a separate `JSON`
- Now the project is linked to my other project: [Breezium](https://github.com/OrakomoRi/Breezium); I create a custom `select` elements using that project
- The theme should now work for test servers as well :tada:

### Changed

- Battle
  - BattleChat
  - BattleTab
    - ColorfulResists
- Clan
  - ClanModal
  - ExistingClan
  - JoinClan
- Containers
  - PossibleRewardsScreen
- Entrance
  - EntranceForms
  - EntranceIcons
  - EntranceLinks
- Friends
  - FriendsScreen
  - InviteScreen
- General
  - CommonContainer
  - LoadingScreen
  - Modal
  - ScrollingCards
  - TopMenu
  - TopPanel
- Lobby
  - BattleSelect
    - BattleType
  - Challenges
    - CommonChallenges
  - ChatWindow
  - NewsWindow
  - PlayButton
- Quests
  - ContractsScreen
  - QuestsScreen
- Variables
- Optimized main userscript
- Optimized all `JS` files of modules
- Some `READMEs` have been updated
- Some `SVGs` were optimized and minified

### Fixed

- Entrance
  - EntranceForms
  - EntranceIcons
- General
  - TopPanel (currency support for shop screen)
- Quests
  - QuestsScreen
- Set default border radius for all hotkeys tooltips blocks

---

## [1.6.1] - 2024-12-20

### Added

- Resource caching

### Changed

- Friends
  - FriendsScreen
- General
  - ScrollingCards
- Lobby
  - Announcements
- Optimized & updated images (added `.webp` format)

---

## [1.6.0] - 2024-08-30

### Added

- First public release of the project! :tada:

### Changed

- Battle
  - BattleChat
- General
  - TopMenu
- Quests
  - ContractsScreen
  - QuestsScreen

### Fixed

- Image loading logic for single modules
- Canvas adding logic for common container

---

## [1.5.0] - 2024-08-12

### Added

- Containers
  - ContainersOpening
  - ContainersScreen
  - PossibleRewardsScreen
- Quests
  - ContractsScreen
  - QuestsScreen
- Logic for new animated wallpapers
- New custom icons
- Screenshots of the standard and theme views :tada:
- Information and/or screenshots in all readme files :tada:
- Logic for loading images by link when loading the Tampermonkey script, followed by auto-conversion to base64

### Changed

- Battle
  - BattleChat
  - BattlePause
  - BattleTab
    - ColorfulResists
    - TabContainer
- Clan
  - ClanModal
  - ExistingClan
  - JoinClan
- Entrance
  - EntranceBackground
  - EntranceForms
  - EntranceIcons
  - EntranceLinks
- Friends
  - FriendsScreen
  - InviteScreen
- General
  - CommonContainer
  - Dropdown
  - LoadingScreen
  - Modal
  - NotificatorIcon
  - PlayerContextMenu
  - ScrollingCards
  - TopMenu
  - TopPanel
  - XP
- Lobby
  - Announcements
  - BattleSelect
    - BattleMode
    - BattleType
  - Challenges
    - CommonChallenges
    - EliteChallenges
  - ChatWindow
  - FooterMenu
  - MainMenu
  - MatchmaikingWaitBlock
  - NewsWindow
  - PlayButton
- Variables
- All `svg` format images are now stored in the `.images/svg/` folder instead of `.images/`
- All used png images are now stored as regular `.png` files in the `.images/png/` folder
- Background for CommonContainer

### Fixed

- Minor fixes to auto-check versions

---

## [1.4.1] - 2024-07-03

### Added

- All source icons

### Changed

- Battle
  - Pause -> BattlePause
  - BattleTab
    - TabContainer
- Clan
  - ClanModal
  - ExistingClan
  - JoinClan
- Entrance
  - EntranceForms
- Friends
  - FriendsScreen
  - InviteScreen
- General
  - CommonContainer
  - Dropdown
  - LoadingScreen
  - Modal
  - NotificatorIcon
  - PlayerContextMenu
  - TopPanel
  - XP
- Lobby
  - Announcements
  - Challenges
    - CommonChallenges
    - EliteChallenges
  - FooterMenu
  - MainMenu
  - MatchmaikingWaitBlock
  - NewsWindow
  - PlayButton
- Variables

### Fixed

- Script's auto-update

---

## [1.4.0] - 2024-06-04

### Added

- Changelog :tada:
- Script's auto-update :tada:

### Changed

- Battle
  - Pause
- Entrance
  - EntranceBackground
  - EntranceForms
  - EntranceLinks
- Friends
  - FriendsScreen
  - InviteScreen
- General
  - Dropdown
  - LoadingScreen
  - NotificatorIcon
  - PlayerContextMenu
  - ScrollingCards
  - TopMenu
  - TopPanel
  - XP
- Lobby
  - ChatWindow
  - MainMenu
  - PlayButton
- Variables
- Background for CommonContainer

---

## [1.3.4] - 2024-05-28

### Changed

- Clan
  - ExistingClan
- Entrance
  - EntranceIcons
  - EntranceLinks
- Friends
  - FriendsScreen
- General
  - LoadingScreen
  - NotificatorIcon
- ProBattles
  - BattleModes -> General/ScrollingCards

---

## [1.3.3] - 2024-05-27

### Added

- ProBattles
  - BattleModes

### Changed

- Battle
  - BattleTab
    - TabContainer
- Battle
  - Pause
- Clan
  - ExistingClan
- Entrance
  - EntranceLinks
- General
  - Dropdown
  - Modal
  - PlayerContextMenu
- Lobby
  - BattleSelect
  - BattleMode
    - BattleType
  - ChatWindow
- Variables

---

## [1.3.2] - 2024-05-24

### Added

- Battle
  - Pause

### Changed

- Lobby
  - Announcements
  - Challenges
    - CommonChallenges
    - EliteChallenges
  - FooterMenu
  - MainMenu
  - MatchmakingWaitBlock
  - PlayButton
- Variables

---

## [1.3.1] - 2024-05-22

### Added

- Lobby
  - MatchmakingWaitBlock

### Changed

- General
  - Dropdown
  - PlayerContextMenu
- Lobby
  - ChatWindow

---

## [1.3.0] - 2024-04-21

### Changed

- Clan
  - ExistingClan
  - JoinClan
- Entrance
  - EntranceLinks
- Friends
  - FriendsScreen
  - InviteScreen
- General
  - CommonContainer
  - Modal
- Lobby
  - FooterMenu
- Variables
- Background for CommonContainer
- Project management (file paths)

---

## [1.2.1] - 2024-03-16

### Changed

- Clan
  - ClanModal
  - ExistingClan
  - JoinClan
- Entrance
  - EntranceBackground
- Variables

---

## [1.2.0] - 2024-03-15

### Added

- Clan
  - ClanModal
  - ExistingClan
  - JoinClan

### Changed

- Battle
  - BattleTab
    - TabContainer
- Entrance
  - EntranceForms
- Friends
  - FriendsScreen
- General
  - Modal
  - TopMenu
  - XP
- Lobby
  - ChatWindow

---

## [1.1.2] - 2024-03-15

### Changed

- Battle
  - BattleTab
    - ColorfulResists
    - TabContainer
- Friends
  - FriendsScreen
- General
  - CommonContainer
  - Modal
  - PlayerContextMenu
- Lobby
  - Challenges
    - CommonChallenges
- Lobby
  - ChatWindow
- Variables

---

## [1.1.1] - 2024-03-12

### Added

- General
  - PlayerContextMenu
- General
  - XP

### Changed

- General
  - CommonContainer
  - NotificatorIcon
- Background for CommonContainer

---

## [1.1.0] - 2024-03-12

### Added

- Friends
  - InviteScreen
- General
  - CommonContainer
- Background for CommonContainer

### Changed

- Battle
  - BattleTab
  - BattleTab/ColorfulResists
- Entrance
  - EntranceForms
  - EntranceIcons
  - EntranceLinks
- Friends
  - FriendsScreen
- General
  - Dropdown
  - LoadingScreen
  - Modal
  - NotificatorIcon
  - TopMenu
  - TopPanel
- Lobby
  - Announcements
  - BattleSelect
    - BattleMode
    - BattleType
  - Challenges
    - CommonChallenges
    - EliteChallenges
  - ChatWindow
  - FooterMenu
  - MainMenu
  - NewsWindow
  - PlayButton
- Variables

### Removed

- NodeJS. Now the project is fully modular :tada:

---

## [1.0.3] - 2024-03-12

### Added

- Friends
  - FriendsScreen
- General
  - TopMenu
- Lobby
  - BattleSelect
    - BattleMode
    - BattleType

### Changed

- General
  - Modal
  - TopPanel
- Lobby
  - Announcements
  - Challenges
    - CommonChallenges
    - EliteChallenges
  - FooterMenu
  - MainMenu
  - PlayButton
- Variables

---

## [1.0.2] - 2024-03-11

### Added

- Lobby
  - Announcements
  - Challenges
    - CommonChallenges
    - EliteChallenges

### Changed

- Entrance
  - EntranceBackground
  - EntranceIcons
- General
  - Modal
  - NotificatorIcon
  - TopPanel
- Lobby
  - ChatWindow
  - FooterMenu
  - NewsWindow
  - PlayButton
- Variables
- Main file of the theme

### Removed

- `JS` files for Lobby/FooterMenu

---

## [1.0.1] - 2024-03-07

### Added

- Lobby
  - ChatWindow
  - NewsWindow

### Changed

- Entrance
  - EntranceLinks
- General
  - LoadingScreen
  - Modal
- Lobby
  - FooterMenu
- Variables
- Path to the folder with additional functions

### Fixed

- Logic for getting current season `getSeason()`

---

## [1.0.0] - 2024-03-06

- NodeJS to combine all `.css` and `.js` together
- Main file of the theme :tada:

### Changed

- Battle
  - ClassedTab
  - ColorfulResists
- Entrance
  - EntranceForms
  - EntranceIcons
  - EntranceLinks
- General
  - LoadingScreen
  - Modal
  - NotificatorIcon
  - TopPanel
- Lobby
  - FooterMenu
  - PlayButton

### Fixed

- Now all `.js` files for theme logic are inside `(function() {})()` to avoid global namespace

---

## [0.0.0] - 2024-03-06

### Added

- Battle
  - BattleChat
  - BattleTab
  - ClassedTab
  - ColorfulResists
- Entrance
  - EntranceBackground
  - EntranceForms
  - EntranceIcons
  - EntranceLinks
- General
  - Dropdown
  - LoadingScreen
  - Modal
  - NotificatorIcon
  - TopPanel
- Lobby
  - FooterMenu
  - MainMenu
  - PlayButton
- Settings
- Shop
- Variables
- Entrance backgrounds
- Play button's background
- Logic for image to base64 conversion from link
- Logic for getting current season

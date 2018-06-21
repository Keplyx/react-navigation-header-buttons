/*
* @flow
*/
import * as React from 'react';
import {
  View,
  UIManager,
  findNodeHandle,
  StyleSheet,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { HeaderButton } from './HeaderButton';
import type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

export const IS_IOS = Platform.OS === 'ios';

export type OverflowButtonProps = {
  OverflowIcon?: React.Element<*>,
  cancelButtonLabel: string,
  onOverflowMenuPress?: ({ hiddenButtons: Array<React.Element<*>> }) => any,
};

type Props = {
  hiddenButtons: Array<React.Element<*>>,
  color: string,
  buttonWrapperStyle?: StyleObj,
  ...$Exact<OverflowButtonProps>,
};

export class OverflowButton extends React.Component<Props> {
  overflowRef: ?View;
  static defaultProps = {
    color: 'grey',
    cancelButtonLabel: 'Cancel',
  };

  setOverflowRef = (ref: ?View) => {
    this.overflowRef = ref;
  };

  render() {
    const { OverflowIcon, buttonWrapperStyle } = this.props;
    return (
      <View>
        <View ref={this.setOverflowRef} style={styles.overflowMenuView} />
        <HeaderButton
          onPress={this.showOverflowPopup}
          ButtonElement={OverflowIcon}
          buttonWrapperStyle={[styles.icon, buttonWrapperStyle]}
          testID="headerOverflowButton"
        />
      </View>
    );
  }

  showOverflowPopup = () => {
    const { onOverflowMenuPress, hiddenButtons } = this.props;
    if (onOverflowMenuPress) {
      onOverflowMenuPress({ hiddenButtons });
    } else {
      IS_IOS ? this.showPopupIos() : this.showPopupAndroid();
    }
  };

  showPopupAndroid() {
    UIManager.showPopupMenu(
      findNodeHandle(this.overflowRef),
      this.props.hiddenButtons.map(btn => btn.props.title),
      err => {
        console.debug(`popup error ${err}`);
      },
      this.onHiddenItemPress
    );
  }

  onHiddenItemPress = (eventName: string, index: number) => {
    if (eventName !== 'itemSelected') return;
    this.props.hiddenButtons[index].props.onPress();
  };

  showPopupIos() {
    let actionTitles = this.props.hiddenButtons.map(btn => btn.props.title);
    actionTitles.push(this.props.cancelButtonLabel);

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: actionTitles,
        cancelButtonIndex: actionTitles.length - 1,
      },
      (buttonIndex: number) => {
        if (buttonIndex !== actionTitles.length - 1) {
          this.onHiddenItemPress('itemSelected', buttonIndex);
        }
      }
    );
  }
}

const styles = StyleSheet.create({
  overflowMenuView: {
    position: 'absolute',
    top: -10,
    // TODO android actually has a little gap on the right of the menu
    right: 0,
    backgroundColor: 'transparent',
    width: 1,
    height: 1,
  },
  icon: {
    marginTop: 2,
    ...Platform.select({
      android: {
        marginRight: 9,
        marginLeft: 7,
      },
    }),
  },
});

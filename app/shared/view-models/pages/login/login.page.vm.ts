import * as emailValidator from 'email-validator';
import {
  Observable,
  PropertyChangeData
} from 'tns-core-modules/data/observable';
import { PtAuthService } from '~/core/contracts/services';
import { PtLoginModel } from '~/core/models/domain';
import { EMPTY_STRING } from '~/core/models/domain/constants/strings';
import { getAuthService } from '~/globals/dependencies/locator';
import { ObservableProperty } from '~/shared/observable-property-decorator';

export class LoginViewModel extends Observable {
  private authService: PtAuthService;
  public email = 'alex@email.com';
  public emailValid = true;
  public emailEmpty = false;
  public password = 'nuvious';
  public passwordEmpty = false;
  public formValid = true;
  @ObservableProperty() public loggingIn = false;

  constructor() {
    super();

    this.authService = getAuthService();
    this.on(
      Observable.propertyChangeEvent,
      (propertyChangeData: PropertyChangeData) => {
        this.validate(propertyChangeData.propertyName);
      }
    );
  }

  public onLoginTapHandler() {
    const loginModel: PtLoginModel = {
      username: this.email,
      password: this.password
    };

    this.loggingIn = true;

    return new Promise((resolve, reject) => {
      this.authService
        .login(loginModel)
        .then(() => {
          this.loggingIn = false;
          resolve();
        })
        .catch(er => {
          this.loggingIn = false;
          reject(er);
        });
    });
  }

  private validate(changedPropName: string) {
    switch (changedPropName) {
      case 'email':
        if (this.email.trim() === EMPTY_STRING) {
          this.set('emailEmpty', true);
          this.set('emailValid', true);
        } else if (emailValidator.validate(this.email)) {
          this.set('emailValid', true);
          this.set('emailEmpty', false);
        } else {
          this.set('emailValid', false);
          this.set('emailEmpty', false);
        }
        break;

      case 'password':
        if (this.password.trim() === EMPTY_STRING) {
          this.set('passwordEmpty', true);
        } else {
          this.set('passwordEmpty', false);
        }
        break;

      default:
        return;
    }
    if (this.emailValid && !this.emailEmpty && !this.passwordEmpty) {
      this.set('formValid', true);
    } else {
      this.set('formValid', false);
    }
  }
}

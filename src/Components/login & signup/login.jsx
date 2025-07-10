import * as React from "react";
import {
  Button,
  FormControl,
  Checkbox,
  FormControlLabel,
  InputLabel,
  OutlinedInput,
  TextField,
  InputAdornment,
  Link,
  IconButton,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { AppProvider } from "@toolpad/core/AppProvider";
import { SignInPage } from "@toolpad/core/SignInPage";
import { useTheme } from "@mui/material/styles";
import axios from "axios";

const providers = [{ id: "credentials", name: "Email and Password" }];

function CustomEmailField() {
  return (
    <TextField
      id="input-with-icon-textfield"
      label="Email"
      name="email"
      type="email"
      size="large"
      required
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <AccountCircle fontSize="inherit" />
            </InputAdornment>
          ),
        },
      }}
      variant="outlined"
    />
  );
}

function CustomPasswordField() {
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  return (
    <FormControl sx={{ my: 10 }} fullWidth variant="outlined">
      <InputLabel size="medium" htmlFor="outlined-adornment-password">
        Password
      </InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        type={showPassword ? "text" : "password"}
        name="password"
        size="large"
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
              size="small"
            >
              {showPassword ? (
                <VisibilityOff fontSize="inherit" />
              ) : (
                <Visibility fontSize="inherit" />
              )}
            </IconButton>
          </InputAdornment>
        }
        label="Password"
      />
    </FormControl>
  );
}

function CustomButton() {
  return (
    <Button
      type="submit"
      variant="outlined"
      color="info"
      size="medium"
      disableElevation
      fullWidth
      sx={{ my: 2 }}
    >
      Log In
    </Button>
  );
}

function SignUpLink() {
  return (
    <Link href="/" variant="body2">
      Sign up
    </Link>
  );
}

function ForgotPasswordLink() {
  return (
    <Link href="/" variant="body2">
      Forgot password?
    </Link>
  );
}

function Title() {
  return <h1 style={{ marginBottom: 8 }}>Login</h1>;
}

function Subtitle() {
  return <p style={{ marginBottom: 8 }}>Welcome back! Please login.</p>;
}

function RememberMeCheckbox() {
  const theme = useTheme();
  return (
    <FormControlLabel
      label="Remember me"
      control={
        <Checkbox
          name="remember"
          value="true"
          color="primary"
          sx={{ padding: 0.5, "& .MuiSvgIcon-root": { fontSize: 20 } }}
        />
      }
      slotProps={{
        typography: {
          color: "textSecondary",
          fontSize: theme.typography.pxToRem(14),
        },
      }}
    />
  );
}

export default function SlotsSignIn() {
  const theme = useTheme();

  return (
    <AppProvider theme={theme}>
      <SignInPage
        signIn={async (provider, formData) => {
          const email = formData.get("email");
          const password = formData.get("password");

          try {
            const response = await axios.post("https://admin.urest.in:8089/api/Auth/login", {
              email,
              password
            }, {
              headers: {
                'Content-Type': 'application/json',
              },
              withCredentials: false
            });
            const data = response?.data;
            if (data.success || response.status === 200) {
              localStorage.setItem("isAuthenticated", "true");
              if (data.token) {
                localStorage.setItem("token", data.token);
              }
              window.location.href = "/dashboard";
            } else {
              alert(data.message || "Invalid email or password");
            }
          } catch (error) {
            const message =
              error.response?.data?.message || "Something went wrong. Please try again.";
            alert("Login failed: " + message);
          }
        }}
        slots={{
          title: Title,
          emailField: CustomEmailField,
          passwordField: CustomPasswordField,
          submitButton: CustomButton,
          signUpLink: SignUpLink,
          rememberMe: RememberMeCheckbox,
          forgotPasswordLink: ForgotPasswordLink,
        }}
        slotProps={{ form: { noValidate: true } }}
        providers={providers}
      />
    </AppProvider>
  );
}

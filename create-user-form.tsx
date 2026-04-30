import { FormEvent, useMemo, useState } from "react";

type Props = {
  onSuccess: () => void;
};

const API_BASE =
  "https://api.challenge.hennge.com/password-validation-challenge-api/001";

const PASSWORD_RULES = [
  {
    message: "Password must be at least 10 characters long",
    isValid: (value: string) => value.length >= 10,
  },
  {
    message: "Password must be at most 24 characters long",
    isValid: (value: string) => value.length <= 24,
  },
  {
    message: "Password cannot contain spaces",
    isValid: (value: string) => !/\s/.test(value),
  },
  {
    message: "Password must contain at least one number",
    isValid: (value: string) => /\d/.test(value),
  },
  {
    message: "Password must contain at least one uppercase letter",
    isValid: (value: string) => /[A-Z]/.test(value),
  },
  {
    message: "Password must contain at least one lowercase letter",
    isValid: (value: string) => /[a-z]/.test(value),
  },
] as const;

export default function CreateUserForm({ onSuccess }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // Replace this with the token from /challenge-details path parameter.
  const authToken = "";

  const failedCriteria = useMemo(
    () => PASSWORD_RULES.filter((rule) => !rule.isValid(password)).map((rule) => rule.message),
    [password],
  );

  const usernameInvalid = username.trim().length === 0;
  const passwordInvalid = failedCriteria.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError("");

    if (usernameInvalid || passwordInvalid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/challenge-signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      if (response.ok) {
        onSuccess();
        return;
      }

      if (response.status === 401 || response.status === 403) {
        setApiError("Not authenticated to access this resource.");
      } else if (response.status === 400) {
        setApiError(
          "Sorry, the entered password is not allowed, please try a different one.",
        );
      } else {
        setApiError("Something went wrong, please try again.");
      }
    } catch {
      setApiError("Something went wrong, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          aria-invalid={usernameInvalid}
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={passwordInvalid}
        />
      </div>

      {failedCriteria.length > 0 && (
        <ul>
          {failedCriteria.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      {apiError && <p>{apiError}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}

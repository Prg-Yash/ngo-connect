import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export const OtpVerification = ({ otp, ngoName }) => {
  return (
    <Html>
      <Head />
      <Preview>Your NGO-Connect verification code: {otp}</Preview>
      <Body style={main}>
        <Container>
          <Section style={content}>
            <Row style={{ ...boxInfos, paddingBottom: "0" }}>
              <Column>
                <Heading style={{ fontSize: 28, fontWeight: "bold", textAlign: "center", color: "#111" }}>
                  Verify your NGO email
                </Heading>
                <Text style={paragraph}>
                  Hi{ngoName ? ` from ${ngoName}` : ""},
                </Text>
                <Text style={paragraph}>
                  Use the code below to verify your email address for NGO-Connect registration.
                  This code expires in <b>10 minutes</b>.
                </Text>

                {/* OTP Code Box */}
                <Section style={otpBox}>
                  <Text style={otpText}>{otp}</Text>
                </Section>

                <Text style={{ ...paragraph, color: "#666", fontSize: 14 }}>
                  If you did not request this, please ignore this email. Do not share this code with anyone.
                </Text>
              </Column>
            </Row>
          </Section>

          <Text style={{ textAlign: "center", fontSize: 12, color: "rgb(0,0,0, 0.5)", marginTop: 24 }}>
            © {new Date().getFullYear()} | NGO-Connect | Email Verification
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f9fafb",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const paragraph = { fontSize: 16, color: "#374151", lineHeight: "1.6" };

const content = {
  border: "1px solid rgb(0,0,0, 0.08)",
  borderRadius: "8px",
  overflow: "hidden",
  backgroundColor: "#ffffff",
  margin: "24px auto",
};

const boxInfos = { padding: "32px" };

const otpBox = {
  backgroundColor: "#f0fdf4",
  border: "2px dashed #1CAC78",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  textAlign: "center",
};

const otpText = {
  fontSize: 40,
  fontWeight: "bold",
  letterSpacing: "12px",
  color: "#1CAC78",
  textAlign: "center",
  margin: 0,
};

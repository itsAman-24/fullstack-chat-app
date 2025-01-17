import { Verification_Email_Template, Welcome_Email_Template } from "../lib/emailTemplate.js";
import { transporter } from "./email.config.js";

export const sendVerificationCode = async (email, code) => {
  try {
    const response = await transporter.sendMail({
      from: '"Chatty-Verification👻" <amanpan2410@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Verify your Email", // Subject line
      text: "Verify your Email", // plain text body
      html: Verification_Email_Template.replace("{verificationCode}", code), // html body
    });
    console.log("Email sent successfuly", response);
  } catch (error) {
    console.log("Email error", error);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    const response = await transporter.sendMail({
      from: '"Chatty-Welcome👻" <amanpan2410@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Welcome", // Subject line
      text: "Welcome", // plain text body
      html: Welcome_Email_Template.replace("{name}", name), // html body
    });
    console.log("Email sent successfuly", response);
  } catch (error) {
    console.log("Email error", error);
  }
};

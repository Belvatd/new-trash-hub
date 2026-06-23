import { UserRegistrationForm } from "@/components/form/UserRegistrationForm"
import { TypeAccount } from "@/constants/type"

const Page = () => {
  return <UserRegistrationForm type={TypeAccount.CLEANER} />
}

export default Page

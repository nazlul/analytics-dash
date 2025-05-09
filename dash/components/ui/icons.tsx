import { Loader2 } from "lucide-react"
import { FcGoogle } from "react-icons/fc"

export const Icons = {
  spinner: (props: React.ComponentProps<"svg">) => (
    <Loader2 {...props} />
  ),
  google: (props: React.ComponentProps<"svg">) => (
    <FcGoogle className={props.className} />
  ),
}

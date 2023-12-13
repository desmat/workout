// used all over by Tailwind UI

export default function classNames(...classes: any) {
    return classes.filter(Boolean).join(' ')
}
import { SuccessIcon } from './SuccessIcon';
import ErrorIcon from './ErrorIcon';
import { useMemo, useState } from "react";
import cssClass from "./Drop.module.scss";
import { m } from "framer-motion";

export interface Props {
    background: string;
    title: string;
    edit?: (file: File) => JSX.Element;
    handler: (file: File) => Promise<JSX.Element>;
    layoutId?: string;
}

const classes:Record<string, string> = {
    drag: cssClass['is-dragover'],
    uploading: cssClass['is-uploading'],
    success: cssClass['is-success'],
    error: cssClass['is-error'],
}

function Drop({background, handler, layoutId, ...props}: Props) {
    const [state, setstate] = useState('')
    const [errormsg, seterrormsg] = useState('')
    const [show, setshow] = useState(<></>)
    function allowDrag(e: React.DragEvent) {
        e.dataTransfer!.dropEffect = 'copy';
        e.preventDefault();
        // e.stopPropagation();
        setstate('drag')
        // showDropZone(true);
    }
    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setstate('input')
        // showDropZone(false);
        const dt = e.dataTransfer!
        openFile(dt.files)
    }
    function openFile(files: FileList) {
        if (files && files[0]) {
            setstate('uploading')
            handler(files[0]).then((res: JSX.Element) => {
                setstate('success')
                if (res)
                    setshow(res)
            }).catch(e => {
                setstate('error')
                seterrormsg(e.message)
            })
        }
    }
    const isAdvancedUpload = useMemo(function() {
        const div = document.createElement('div');
        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
    }, []);
    const formcss = [cssClass.box,cssClass.js]
    if (isAdvancedUpload) {
        formcss.push(cssClass['has-advanced-upload'])
    }
    return <m.div layoutId={layoutId} className={cssClass.heading} style={{
            'backgroundImage': `linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 1)),url(${background})`,
            'backgroundSize': 'cover',
            'backgroundPosition': 'center',
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}>
        <form 
        onDragEnter={allowDrag}
        onDragOver={allowDrag}
        onDragLeave={() => {
            setstate('input')
        }}
        onDrop={handleDrop} className={formcss.join(" ") + " " + (classes[state] ?? "")}>
            <div className={cssClass.box__input}>
                <svg className={cssClass.box__icon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5"/>
                </svg>
                <input className={cssClass.box__file} type="file" id="file" multiple onChange={e => {
                    const input = e.target
                    const files = input.files
                    if (files){
                        openFile(files)
                    }
                }}/>
                <label htmlFor="file"><strong>Choose a file</strong><span className={cssClass.box__dragndrop}> or drag it here</span>.</label>
                <button className={cssClass.box__button} type="submit">Upload</button>
            </div>
            <div className={cssClass.box__editing}></div>
            <div className={cssClass.box__uploading}><svg style={{
                    color: '#00bbcc',
                    fill: 'none',
                    width: "100%",
                    height: "80px",
                    // 'marginBottom': "40px",
                    display: 'block',
            }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Processing…</div>
            <div className={cssClass.box__success}><SuccessIcon />Done!<br/>{show}</div>
            <div className={cssClass.box__error}>
            <ErrorIcon/>
            Error!<br/><br/>{errormsg}<span></span>.</div>
        </form>
    </m.div>
}
export default Drop
